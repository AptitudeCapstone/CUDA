import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList
} from 'react-native';
import {fonts, format, deviceCard, modal} from '../style';
import IconE from 'react-native-vector-icons/Entypo';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalSelector from 'react-native-modal-selector-searchable';
import FastImage from 'react-native-fast-image';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import UserBar from '../components/UserBar';
import {useAuth} from '../contexts/UserContext';
const Buffer = require("buffer").Buffer;
import { BleManager } from 'react-native-ble-plx';

export const manager = new BleManager();

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
const Monitor = ({navigation}) => {
    const bigLayout = Platform.isPad,
        dimensions = useWindowDimensions(),
        serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13',
        [discoveredReaders, setDiscoveredReaders] = useState(() => new Object),
        [connectedReaders, setConnectedReaders] = useState(() => new Object),
        [discoveredNamesArray, setDiscoveredNamesArray] = useState(() => []),
        [showingDiscoveredList, setShowingDiscoveredList] = useState(() => false),
        autoConnectByName = useRef(false);

    /*
         BLE
         Single service with 1 characteristic 'deviceStatuses'
         Formatted as a JSON str (ascii) but comes as base64
    */

    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                scanAndConnect();
                subscription.remove();
            }
        }, true);
        return () => subscription.remove();
    }, [manager]);

     async function subscribe(device) {
            device.monitorCharacteristicForService(serviceUUID, '04CB0EB1-8B58-44D0-91E4-080AF33438BA', (error, characteristic) => {
                const bytes = characteristic.value;
                if (!error && characteristic.value) {
                    // convert from base64 -> ascii -> json object as map
                    const b64buf = new Buffer(bytes, 'base64');
                    const aStr = b64buf.toString('ascii');
                    const jObj = JSON.parse(aStr);
                    console.log('peripheral update received from:', device.id);
                    updateConnectedReaders(device.id, jObj);
                } else {
                    console.log(error.message)
                }
            })
    }

    const connectToDevice = (device) => {
        device.connect()
            .then((device) => {
                updateConnectedReaders(device.id, '{"status":"fetching data"}');
                console.log("Discovering services and characteristics");
                return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
                console.log("Subscribing");
                return subscribe(device);
            })
            .then(() => {
                console.log("Listening...");
            }, (error) => {
                console.log(error.message);
            })
    }

    const scanAndConnect = () => {
        manager.startDeviceScan(null,
            null, (error, device) => {
                if (error) {
                    console.log(error.message);
                    return;
                }

                if(!device || !device?.name) {
                    return;
                }

                if (device.name.includes('AMS-')) {
                    updateDiscoveredReaders(device.id, '{"status":"not connected"}');

                    if(autoConnectByName) {
                        console.log("Found reader to reader", device.name);
                        connectToDevice(device);
                    }
                }
            });
    }

    const updateDiscoveredReaders = (id, statuses) => {
        let tObj = discoveredReaders;
        tObj[id] = statuses;
        setDiscoveredReaders(tObj);

        console.log('newest connected readers data:',
            JSON.stringify(tObj, null, 4)
            , '\n\n\n');
    }

    const updateConnectedReaders = (id, statuses) => {
        let tObj = connectedReaders;
        tObj[id] = statuses;
        setConnectedReaders(tObj);

        console.log('newest connected readers data:',
            JSON.stringify(tObj, null, 4)
            , '\n\n\n');
    }

    /*
        covid heating
        {"status":"ok","data":{"wifi":"client","bt":"running","pico":"waiting","heater":"ready","measurement":{"remainingTime":1800,"started":true,"reason":"Wait for Heating to 65"},"reader":"running"},"action":"status.getModuleStatus"}

        covid running
        {"status":"ok","data":{"wifi":"client","bt":"running","pico":"running","heater":"ready","measurement":{"remainingTime":1794.8793834239987,"started":true,"reason":null},"reader":"running"},"action":"status.getModuleStatus"}

        covid finished

     */

    const ConnectedPeripheral = ({peripheralUUID, peripheralStatuses}) => {
        console.log('device uuid:', peripheralUUID);
        console.log('statuses:', peripheralStatuses);
        const selectedPatient = "Noah";

        const cardStyle = (connectedReaders.size > 1) ?
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
        const timeRemaining = 15;

        return (
            <View style={[deviceCard.container, cardStyle]}>
                <View style={deviceCard.device}>
                    <View style={deviceCard.header}>
                        <Text style={deviceCard.nameText}>{name}</Text>
                    </View>
                    <View style={deviceCard.body}>
                        <Text style={deviceCard.characteristicText}>
                            {(peripheralStatuses ? JSON.stringify(peripheralStatuses, null, 4) : 'No statuses to report')}
                        </Text>
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

    const toggleDiscoveredModal = () => setShowingDiscoveredList(!showingDiscoveredList);

    const PeripheralList = () => (
            <FlatList
                horizontal={true}
                data={
                    connectedReaders
                }
                extraData={connectedReaders}
                renderItem={({item}) => <ConnectedPeripheral
                        peripheral={item['peripheralUUID']}
                        statuses={item['peripheralStatuses']} />
                }
                keyExtractor={(item) => item['peripheralUUID']}
            />
        );

    const numberAvailableDevicesStr = () => {
        if(discoveredReaders && discoveredReaders.size) {
            if(discoveredReaders.size === 1) {
                return '1 available device';
            } else {
                return discoveredReaders.size.toString() + ' available devices'
            }
        } else {
            return '0 available devices';
        }
    }

    const numberConnectedDevicesStr = () => {
        if(connectedReaders.size && connectedReaders.size) {
            if(connectedReaders.size === 1) {
                return '1 connected device';
            } else {
                return connectedReaders.size.toString() + ' connected devices'
            }
        } else {
            return '0 connected devices';
        }
    }

    return (
        <SafeAreaView style={{flex: 1,}}>
            <View style={format.page}>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <View style={{flexGrow: 0.95}}>
                        <Text style={[fonts.username, {alignSelf: 'center', paddingVertical: 8}]}>
                            Connect new devices
                        </Text>
                        <TouchableOpacity  onPress={toggleDiscoveredModal}  style={format.modalSelector}>
                            <Text style={fonts.username}>
                                {'discoverd:' + numberAvailableDevicesStr() + ' connected: ' + numberConnectedDevicesStr()}
                            </Text>
                            <IconE style={fonts.username} size={34}
                                   name={showingDiscoveredList ? 'chevron-up' : 'chevron-down'}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <ModalSelector
                    onChange={(selectedItem) => {
                        //connectPeripheralByID(selectedItem.key);
                        setShowingDiscoveredList(false);
                    }}
                    renderItem={<View />}
                    customSelector={<View />}
                    visible={showingDiscoveredList}
                    data={
                        Array.from(Object.entries(discoveredNamesArray)
                            .map((key, value) => ({
                                key: key,
                                name: value
                            }))
                        )
                    }
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
                <PeripheralList />
            </View>
            <UserBar navigation={navigation} />
        </SafeAreaView>
    );
}

export default Monitor;