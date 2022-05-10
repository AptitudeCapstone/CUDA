import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    useWindowDimensions,
    FlatList,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View, StyleSheet, Image
} from 'react-native';
import {buttons, fonts, format, deviceCard} from '../../style/style';
import IconE from 'react-native-vector-icons/Entypo';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalSelector from 'react-native-modal-selector-searchable';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {useIsFocused} from '@react-navigation/native';
import BleManager from 'react-native-ble-manager';
import {Buffer} from 'buffer';
import IconF from "react-native-vector-icons/Feather";
import IconA from "react-native-vector-icons/AntDesign";
import FastImage from 'react-native-fast-image';
import AnimatedPlayer, {IAnimatedPlayerReference} from 'react-native-animated-webp';
import animatedImage from './tCardInsert_2.webp';


export const Monitor = ({navigation, route}) => {
    const bigLayout = Platform.isPad,
        isFocused = useIsFocused(),
        dimensions = useWindowDimensions(),
        scanInterval = 3.0, // BLE scan interval in seconds
        BleManagerModule = NativeModules.BleManager,
        bleEmitter = new NativeEventEmitter(BleManagerModule),
        serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13',
        characteristics = {
            picoStatus: '04CB0EB1-8B58-44D0-91E4-080AF33438BA',
            programTask: '04CB0EB1-8B58-44D0-91E4-080AF33438BB',
            chipType: '04CB0EB1-8B58-44D0-91E4-080AF33438BD',
            lastResult: '04CB0EB1-8B58-44D0-91E4-080AF33438BE',
            lastResultTime: '04CB0EB1-8B58-44D0-91E4-080AF33438BF'
        },
        charNameMap = Object.fromEntries(Object.entries(characteristics).map(a => a.reverse())),
        discoveredPeripherals = new Map(),
        connectedPeripherals = new Map(),
        [modalPeripheralsList, setModalPeripheralsList] = useState([]),
        [peripheralsList, setPeripheralsList] = useState([]),
        autoConnectByName = useRef(false),
        [isScanning, setIsScanning] = useState(false),
        [viewPeripheralsModal, setViewPeripheralsModal] = useState(false);

    /*

                BLE

                Single service with 6 characteristics
                1. Pico status
                2. Program task
                3. Sensor type
                4. Last result
                5. Last result timestamp

         */

    /*

            BLUETOOTH HANDLER AND HELPER FUNCTIONS

     */

    useEffect(() => {
        BleManager.start({showAlert: false}).then(() => {
            // Add BLE listeners on component mount
            bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleEmitter.addListener('BleManagerStopScan', handleStopScan);
            bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleEmitter.addListener('BleManagerConnectPeripheral', handleConnectedPeripheral);
            bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

            // Check location permissions for android devices
            if (Platform.OS === 'android' && Platform.Version >= 23) {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
                    if (r1) return;

                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
                        if (r2) return;
                    });
                });
            }
        });

        // Remove all BLE listeners on unmount
        return () => {
            bleEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
            bleEmitter.removeAllListeners('BleManagerStopScan');
            bleEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
            bleEmitter.removeAllListeners('BleManagerConnectPeripheral');
            bleEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
        };
    }, []);

    const handleDiscoverPeripheral = (peripheral) => {
        if (!connectedPeripherals.has(peripheral['id']) && nameMatchesCUDA(peripheral)) {
            discoveredPeripherals.set(peripheral['id'], peripheral);

            if (autoConnectByName.current) {
                BleManager.isPeripheralConnected(peripheral['id'], [])
                    .then((isConnected) => {
                        if (!isConnected) {
                            connectPeripheral(peripheral);
                        }
                    });
            }
        } else if (connectedPeripherals.has(peripheral['id'])) {
            updatePeripheralInfo(peripheral['id'], peripheral);
        }
    }

    const updatePeripheralInfo = (peripheralID, peripheral) => {
        connectedPeripherals.get(peripheralID)['peripheral'] = peripheral;
        updateDeviceList();
    }

    const updateDeviceList = () => {
        setModalPeripheralsList(
            Array.from(discoveredPeripherals.values())
                .map(item => (
                    {
                        key: item['id'],
                        label: item['name']
                    }))
        );

        setPeripheralsList(Array.from(connectedPeripherals.values()));
    }

    const connectPeripheral = (peripheral) => {
        if (peripheral && !connectedPeripherals.has(peripheral['id'])) {
            BleManager.isPeripheralConnected(peripheral['id'], [])
                .then((isConnected) => {
                    if (!isConnected) {
                        BleManager.connect(peripheral['id']).catch(err => {
                            console.debug('BLE: Error connecting to peripheral - ' + err)
                        });
                    }
                });
        }
    }

    const connectPeripheralByID = (peripheralID) => {
        if (!connectedPeripherals.has(peripheralID)) {
            BleManager.isPeripheralConnected(peripheralID, [])
                .then((isConnected) => {
                    if (!isConnected) {
                        BleManager.connect(peripheralID).catch(err => {
                            console.debug('BLE: Error connecting to peripheral - ' + err)
                        });
                    }
                });
        }
    }

    const handleConnectedPeripheral = (event) => {
        BleManager.retrieveServices(event['peripheral']).then((peripheral) => {
            discoveredPeripherals.delete(peripheral['id']);
            connectedPeripherals.set(peripheral['id'], {
                peripheral: peripheral,
                characteristic_values: new Map()
            });

            for (const charUUID of Object.values(characteristics)) {
                BleManager.read(peripheral['id'], serviceUUID, charUUID)
                    .then(readData => {
                        readData = decodeCharBuffer(readData);
                        updateCharacteristicValue(peripheral['id'], charUUID, readData);
                    }).catch(error => {
                    console.debug('BLE: Error reading ', error);
                });

                BleManager.startNotification(peripheral['id'], serviceUUID, charUUID).catch(error => {
                    console.debug('BLE: Error subscribing', error);
                });
            }

            updateDeviceList();
        });
    };

    const handleDisconnectedPeripheral = (event) => {
        const peripheral = connectedPeripherals.get(event['peripheral']);

        if (peripheral) {
            connectedPeripherals.delete(peripheral['id']);
            discoveredPeripherals.set(peripheral['id'], peripheral);
        }
    }

    const handleStopScan = () => {
        setIsScanning(false);
        updateDeviceList();
    };

    const scanPeripherals = () => {
        if (!isScanning) {
            BleManager.scan([], scanInterval, false)
                .then(() => {
                    setIsScanning(true);
                }).catch((err) => {
                console.error(err);
            });
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            scanPeripherals();
        }, scanInterval * 1000);
        return () => clearInterval(interval);
    }, []);

    const nameMatchesCUDA = (peripheral) => {
        return (peripheral &&
            peripheral['advertising'] &&
            peripheral['advertising']['localName'] &&
            peripheral['advertising']['localName'].includes('AMS-') === true)
    }

    const decodeCharBuffer = (charBuffer) => Buffer.from(charBuffer).toString('ascii');

    const handleUpdateValueForCharacteristic = (update) => {
        if (update && update['value']) {
            updateCharacteristicValue(update['peripheral'],
                update['characteristic'],
                decodeCharBuffer(update['value']));
            updateDeviceList();

            // Define additional behavior on characteristic updates
            switch (update['characteristic']) {
                case characteristics['chipType']:
                    const data = update['value'][0].toString();
                    if (data === "-1") {
                        Alert.alert("Chip removal detected", "If a test was in progress, please wait before inserting the chip again");
                    } else if (data === "7") {
                        Alert.alert("Chip insertion detected", "Please wait while COVID testing begins");
                    } else {
                        Alert.alert("Chip insertion detected", "Please insert the sample into the collector and wait");
                    }
                    break;
                default:
                    break;
            }
        } else {
            console.debug("BLE: Unrecognized bluetooth packet received");
        }
    };

    const updateCharacteristicValue = (peripheralID, charUUID, value) => {
        connectedPeripherals.get(peripheralID)['characteristic_values'].set(charNameMap[charUUID], value);
        updateDeviceList();
    }

    const connectedPeripheral = (item) => {
        let iconName = 'signal-cellular-3';
        const rssi = item['peripheral']['rssi'];
        if (rssi) {
            if (rssi >= -75) {
                iconName = 'signal-cellular-2';
            } else if (rssi >= -85) {
                iconName = 'signal-cellular-1';
            }
        }

        const name = item['peripheral']['name'],
            characteristicValues = item['characteristic_values'];

        console.log(item);
        const picoStatus = characteristicValues['picoStatus'],
            programTask = characteristicValues['programTask'],
            chipType = characteristicValues['chipType'],
            lastResult = characteristicValues['lastResult'],
            lastResultTime = characteristicValues['lastResultTime'];


        const selectedPatient = "Noah";

        let cardStyle = {
            width: dimensions.width * 0.5,
            marginLeft: dimensions.width * 0.25,
            marginRight: dimensions.width * 0.25,
        };
        if(connectedPeripherals.size > 1) {
            cardStyle = {
                width: dimensions.width * 0.25,
                marginLeft: dimensions.width * 0.125,
                marginRight: dimensions.width * 0.125,
            }
        }


        let gifStyle = {width: 0, height: 0}
        if(chipType === "-1") {
            gifStyle = {alignSelf: 'center', width: 250, height: 250,}
        }

        return (
            <View style={[deviceCard.container, cardStyle]}>
                <View style={deviceCard.device}>
                    <View style={{
                        paddingHorizontal: 30,
                        paddingVertical: 15,
                        borderTopRightRadius: 40,
                        borderTopLeftRadius: 40,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderTopWidth: 1,
                        borderColor: '#555',
                        backgroundColor: '#222',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={deviceCard.nameText}>{name}</Text>
                        <View style={{paddingTop: 7}}><IconMCI name={iconName} size={30} color="#fff"/></View>
                    </View>
                    <View style={{
                        borderBottomRightRadius: 40,
                        borderBottomLeftRadius: 40,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: '#555',
                        backgroundColor: '#333',
                    }}>

                        {
                            chipType === "-1" &&
                            <Text style={deviceCard.characteristicText}>Insert a chip to begin testing</Text>
                        }

                        {
                            selectedPatient !== null &&
                            <Text style={deviceCard.characteristicText}>Selected Patient: {selectedPatient}</Text>
                        }
                        {
                            lastResult !== "-1" &&
                            <Text style={deviceCard.characteristicText}>Last result was {lastResult} recorded at {lastResultTime}</Text>
                        }
                        {/*
                        <Text style={deviceCard.characteristicText}>Pico Status: {picoStatus}</Text>
                        <Text style={deviceCard.characteristicText}>Program Task: {programTask}</Text>
                        */}
                    </View>
                </View>
                {
                    /*
                    chipType === "-1" &&
                    <View style={{alignSelf: 'center', width: 200, height: 200,}}>
                        <Image
                            style={{
                                flex: 1,
                                width: null,
                                height: null,
                                resizeMode: 'contain',
                                borderRadius: 1000,
                                borderWidth: 1,
                                borderColor: '#555'
                            }}
                            source={require('./grayCardInsert.gif')} />
                    </View>

                     */
                }
                {
                    selectedPatient === null &&
                    <TouchableOpacity style={deviceCard.button}>
                        <Text style={deviceCard.buttonText}>Select patient for next test result</Text>
                    </TouchableOpacity>
                }
                {
                    selectedPatient !== null &&
                    <TouchableOpacity style={deviceCard.button}>
                        <Text style={deviceCard.buttonText}>Change patient for next test result</Text>
                    </TouchableOpacity>
                }
                <TouchableOpacity style={deviceCard.button}>
                    <Text style={deviceCard.buttonText}>Disconnect</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleViewPatientModal = () => {
        setViewPeripheralsModal(!viewPeripheralsModal);
    }

    const PeripheralList = () => {
        return (
                <FlatList
                    horizontal={true}
                    data={
                        //dummyPeripheralList
                        peripheralsList
                    }
                    extraData={peripheralsList}
                    renderItem={({item}) => connectedPeripheral(item)}
                    keyExtractor={(item) => item['peripheral']['id']}
                />

        );
    }


    return (
        <SafeAreaView style={format.page}>
            <ModalSelector
                data={modalPeripheralsList}
                onChange={(option) => {
                    connectPeripheralByID(option.key);
                    setViewPeripheralsModal(false);
                }}
                optionContainerStyle={{
                    backgroundColor: '#111',
                    border: 0
                }}
                optionTextStyle={{
                    color: '#444',
                    fontSize: 18,
                    fontWeight: 'bold'
                }}
                optionStyle={{
                    padding: 20,
                    backgroundColor: '#eee',
                    borderRadius: 100,
                    margin: 5,
                    marginBottom: 15,
                    borderColor: '#222'
                }}
                cancelText={'Cancel'}
                cancelStyle={{
                    padding: 20,
                    backgroundColor: '#eee',
                    borderRadius: 100,
                    margin: 5,
                    marginBottom: 15,
                    borderColor: '#222'
                }}
                cancelTextStyle={{
                    color: '#444',
                    fontSize: 18,
                    fontWeight: 'bold'
                }}
                visible={viewPeripheralsModal}
                onCancel={() => {
                    toggleViewPatientModal();
                }}
                customSelector={<View />}
                searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                listType={'FLATLIST'}
                renderItem={<View/>}
            />
            <View>
                <TouchableOpacity
                    onPress={() => toggleViewPatientModal()}
                    style={{
                        marginBottom: 20,
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginLeft: 20,
                        marginRight: 20,
                        padding: 14,
                        paddingLeft: 20,
                        paddingRight: 20,
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: '#888'
                    }}
                >
                    <Text style={fonts.username}>
                        Select a device to monitor
                    </Text>
                    <IconE style={fonts.username}
                           name={viewPeripheralsModal ? 'chevron-up' : 'chevron-down'} size={34}
                    />
                </TouchableOpacity>
            </View>
            <PeripheralList/>
        </SafeAreaView>
    );
}