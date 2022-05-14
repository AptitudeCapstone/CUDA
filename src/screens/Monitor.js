import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {fonts, format, deviceCard, modal} from '../style';
import IconE from 'react-native-vector-icons/Entypo';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalSelector from 'react-native-modal-selector-searchable';
import BleManager from 'react-native-ble-manager';
import {Buffer} from 'buffer';
import FastImage from 'react-native-fast-image';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import HeaderBar from '../components/HeaderBar';
import {useUserAuth} from '../contexts/UserContext';
/*
const ChipAnimation = () => {
    const playerRef = useRef();

    return (
            <FastImage
                ref={playerRef}
                style={{alignSelf: 'center', width: 200, height: 200, marginHorizontal: -20, marginVertical: -20}}
                source={require('./card-animation.webp')}
            />

    );
};


 */
const Monitor = ({navigation, route}) => {
    const bigLayout = Platform.isPad,
        dimensions = useWindowDimensions(),
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
        discoveredPeripheralsList = useRef([]),
        connectedPeripheralsList = useRef([]),
        [lazyDiscoveredList, setLazyDiscoveredList] = useState([]),
        [lazyConnectedList, setLazyConnectedList] = useState([]),
        autoConnectByName = useRef(false),
        [discoveredPeripheralsModal, setDiscoveredPeripheralsModal] = useState(false),
        [connectedPeripheralsModal, setConnectedPeripheralsModal] = useState(false),
        [selectedPeripheral, setSelectedPeripheral] = useState(null);

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
        updatePeripheralLists();
    }

    const updatePeripheralLists = () => {
        const mostRecentDiscovered = Array.from(discoveredPeripherals.values())
                        .map(item => (
                            {
                                key: item['id'],
                                label: item['name']
                            }));
        if (JSON.stringify(discoveredPeripheralsList.current) !== JSON.stringify(mostRecentDiscovered)) {
            //console.debug('important values changed, updating lazy discovered peripherals list');
            //console.debug('prev: ', discoveredPeripheralsList.current);
            //console.debug('next: ', mostRecentDiscovered);
            discoveredPeripheralsList.current = mostRecentDiscovered;
            updateLazyDiscoveredList();
        }

        const mostRecentConnected = Array.from(connectedPeripherals.values())
                                        .map(item => (
                                            {
                                                key: item['peripheral']['id'],
                                                label: item['peripheral']['name'],
                                                name: item['peripheral']['name'],
                                                characteristic_values: item['characteristic_values']
                                            }));
        if(JSON.stringify(connectedPeripheralsList.current) !== JSON.stringify(mostRecentConnected)) {
            //console.debug('important values changed, updating lazy connected peripherals list');
            //console.debug('prev: ', connectedPeripheralsList.current);
            //console.debug('next: ', mostRecentConnected);
            connectedPeripheralsList.current = mostRecentConnected;
            updateLazyConnectedList();
        }
    }

    const updateLazyDiscoveredList = useCallback(
        () => {
            //console.log('updated lazy discovered list');
            setLazyDiscoveredList(discoveredPeripheralsList.current);
        },
        [discoveredPeripheralsList.current],
    );

    const updateLazyConnectedList = useCallback(
        () => {
            //console.log('updated lazy connected list');
            setLazyConnectedList(connectedPeripheralsList.current);

            if(connectedPeripheralsList.current.length === 1) {
                setSelectedPeripheral(connectedPeripheralsList.current[0]);
            }
        },
        [connectedPeripheralsList.current],
    );

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

            updatePeripheralLists();
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
        updatePeripheralLists();
    };

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

            updatePeripheralLists();

            // Define additional behavior on characteristic updates
            /*
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
             */
        } else {
            console.debug("BLE: Unrecognized bluetooth packet received");
        }
    };

    const updateCharacteristicValue = (peripheralID, charUUID, value) => {
        connectedPeripherals.get(peripheralID)['characteristic_values'].set(charNameMap[charUUID], value);
    }

    const deviceStateFromCharacteristics = (characteristicValues) => {
        const picoStatus = characteristicValues.get('picoStatus'),
            programTask = characteristicValues.get('programTask'),
            chipType = characteristicValues.get('chipType'),
            lastResult = characteristicValues.get('lastResult'),
            lastResultTime = characteristicValues.get('lastResultTime');

        return "Fibrinogen measurement";

        let deviceState = "";
        if(chipType === "-1") {
            deviceState = "Waiting for chip";
        } else {
            if(chipType === "7") {
                // covid chip inserted
                if(programTask === "Heating") {
                    // display heating text
                    deviceState = "Heating";
                } else if(programTask === "COVID measurement") {
                    // start covid (30 min) measurement animation if not already started
                    deviceState = "COVID measurement";
                } else {
                    // display last result
                    deviceState = "Finished COVID";
                }

            } else if(chipType === "6") {
                // fibrinogen chip inserted
                if(programTask === "Waiting for fluid fill") {
                    // chip inserted but fluid fill not complete
                    deviceState = "Waiting for fibrinogen fluid";
                } else if(programTask === "Fibrinogen measurement") {
                    // start fibrinogen (30 sec) measurement animation if not already started
                    deviceState = "Fibrinogen measurement";
                } else {
                    // display last result
                    deviceState = "Finished fibrinogen";
                }
            }

            deviceState = "";
        }
        return deviceState;
    }

    const SelectedPeripheral = () => {
        const selectedPatient = "Noah";
        const name = selectedPeripheral['name'];
        const characteristicValues = selectedPeripheral['characteristic_values'];
        const deviceState = deviceStateFromCharacteristics(characteristicValues);

        const picoStatus = characteristicValues.get('picoStatus'),
            programTask = characteristicValues.get('programTask'),
            chipType = characteristicValues.get('chipType'),
            lastResult = characteristicValues.get('lastResult'),
            lastResultTime = characteristicValues.get('lastResultTime'),
            timeRemaining = characteristicValues.get('timeRemaining', 30);

        const cardStyle = (connectedPeripherals.size > 1) ?
            {
                width: dimensions.width * 0.25,
                marginLeft: dimensions.width * 0.125,
                marginRight: dimensions.width * 0.125,
            } :
            {
                width: dimensions.width * 0.5,
                marginLeft: dimensions.width * 0.25,
                marginRight: dimensions.width * 0.25,
            };

        return (
            <View style={[deviceCard.container, cardStyle]}>
                <View style={deviceCard.device}>
                    <View style={deviceCard.header}>
                        <Text style={deviceCard.nameText}>{name}</Text>
                    </View>
                    <View style={deviceCard.body}>
                        {
                            (deviceState === "Waiting for chip") &&
                            <View>
                                <Text>Insert the sample collector chip</Text>
                            </View>
                        }
                        {
                            (deviceState === "Heating") &&
                            <View>
                                <Text>Please wait for the device to finish heating</Text>
                            </View>
                        }
                        {
                            (deviceState === "Waiting for fibrinogen fluid") &&
                            <View>
                                <Text>Insert the sample into the sample collector</Text>
                            </View>
                        }
                        {
                            (deviceState === "COVID measurement") &&
                            <View>
                                <Text>COVID test in progress</Text>
                                <CountdownCircleTimer
                                    isPlaying
                                    duration={30}
                                    initialTimeRemaining={timeRemaining}
                                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                                    colorsTime={[24, 16, 8, 0]}
                                >
                                    {({ remainingTime }) => <Text>{remainingTime}</Text>}
                                </CountdownCircleTimer>
                            </View>
                        }
                        {
                            (deviceState === "Fibrinogen measurement") &&
                            <View>
                                <Text>Fibrinogen test in progress</Text>
                                <CountdownCircleTimer
                                    isPlaying
                                    duration={60}
                                    initialTimeRemaining={timeRemaining}
                                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                                    colorsTime={[48, 24, 16, 0]}
                                >
                                    {({ remainingTime }) => <Text>{remainingTime}</Text>}
                                </CountdownCircleTimer>
                            </View>
                        }
                        {
                            (selectedPatient !== null) &&
                            <Text style={deviceCard.characteristicText}>Selected Patient: {selectedPatient}</Text>
                        }
                        {
                            (lastResult !== "-1") &&
                            <Text style={deviceCard.characteristicText}>
                                Last result was {lastResult} recorded at {lastResultTime}
                            </Text>
                        }
                        {
                            /*
                                <Text style={deviceCard.characteristicText}>Pico Status: {picoStatus}</Text>
                                <Text style={deviceCard.characteristicText}>Program Task: {programTask}</Text>
                            */
                        }
                    </View>
                </View>
                <TouchableOpacity style={deviceCard.button}>
                    <Text style={deviceCard.buttonText}>Change patient for next test result</Text>
                </TouchableOpacity>
                <TouchableOpacity style={deviceCard.button}>
                    <Text style={deviceCard.buttonText}>Disconnect</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleDiscoveredModal = () => setDiscoveredPeripheralsModal(!discoveredPeripheralsModal);
    const toggleConnectedModal = () => setConnectedPeripheralsModal(!connectedPeripheralsModal);


    return (
        <SafeAreaView style={{backgroundColor: '#222', flex: 1,}}>
            <HeaderBar navigation={navigation} />
            <View style={format.page}>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <View style={{flexGrow: 0.5}}>
                        <Text style={[fonts.username, {alignSelf: 'center', paddingVertical: 8}]}>
                            Connectable Devices
                        </Text>
                        <TouchableOpacity  onPress={toggleDiscoveredModal}  style={format.modalSelector}>
                            <Text style={fonts.username}>
                                {discoveredPeripheralsList.current.length}
                                {
                                    (discoveredPeripheralsList.current.length > 1 ||
                                     discoveredPeripheralsList.current.length === 0)
                                     ? ' connectable devices' : ' connectable device'
                                }
                            </Text>
                            <IconE style={fonts.username} size={34}
                                   name={discoveredPeripheralsModal ? 'chevron-up' : 'chevron-down'}/>
                        </TouchableOpacity>
                    </View>
                    {
                        (connectedPeripheralsList.current.length > 0) &&
                        <View style={{flexGrow: 0.5}}>
                            <Text style={[fonts.username, {alignSelf: 'center', paddingVertical: 8}]}>
                                Device to Monitor
                            </Text>
                            <TouchableOpacity  onPress={toggleConnectedModal}  style={format.modalSelector}>
                                <Text style={fonts.username}>
                                    {connectedPeripheralsList.current.length}
                                    {connectedPeripheralsList.current.length > 1 ? ' connected devices' : ' connected device'}
                                </Text>
                                <IconE style={fonts.username} size={34}
                                       name={connectedPeripheralsModal ? 'chevron-up' : 'chevron-down'} />
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                <ModalSelector
                    onChange={(selectedItem) => {
                        connectPeripheralByID(selectedItem.key);
                        setDiscoveredPeripheralsModal(false);
                    }}
                    renderItem={<View />}
                    customSelector={<View />}
                    visible={discoveredPeripheralsModal}
                    data={lazyDiscoveredList}
                    onCancel={() => toggleDiscoveredModal()}
                    cancelText={'Cancel'}
                    searchText={'Search by device name'}
                    overlayStyle={modal.overlay}
                    optionContainerStyle={modal.container}
                    optionTextStyle={modal.optionText}
                    optionStyle={modal.option}
                    cancelStyle={modal.cancelOption}
                    cancelTextStyle={modal.cancelText}
                    searchStyle={modal.searchBar}
                    initValueTextStyle={modal.searchText}
                    searchTextStyle={modal.searchText}
                />
                <ModalSelector
                    onChange={(selectedItem) => {
                        setSelectedPeripheral(selectedItem);
                        setConnectedPeripheralsModal(false);
                    }}
                    renderItem={<View />}
                    customSelector={<View />}
                    visible={connectedPeripheralsModal}
                    data={lazyConnectedList}
                    onCancel={() => toggleConnectedModal()}
                    cancelText={'Cancel'}
                    searchText={'Search by device name'}
                    keyExtractor= {item => 'connected_' + item.id}
                    overlayStyle={modal.overlay}
                    optionContainerStyle={modal.container}
                    optionTextStyle={modal.optionText}
                    optionStyle={modal.option}
                    cancelStyle={modal.cancelOption}
                    cancelTextStyle={modal.cancelText}
                    searchStyle={modal.searchBar}
                    initValueTextStyle={modal.searchText}
                    searchTextStyle={modal.searchText}
                />
                {
                    selectedPeripheral !== null &&
                    <SelectedPeripheral />
                }
            </View>
        </SafeAreaView>
    );
}

export default Monitor;