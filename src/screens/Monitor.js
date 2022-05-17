import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList, ActivityIndicator, VirtualizedList, ScrollView
} from 'react-native';
import {fonts, format, deviceCard, modal} from '../style';
import IconE from 'react-native-vector-icons/Entypo';
import IconA from 'react-native-vector-icons/AntDesign';
import ModalSelector from 'react-native-modal-selector-searchable';
import FastImage from 'react-native-fast-image';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import UserBar from '../components/UserBar';
import {useAuth} from '../contexts/UserContext';
import { BleManager } from 'react-native-ble-plx';
import IconF from "react-native-vector-icons/Feather";
const Buffer = require("buffer").Buffer;

export const manager = new BleManager();


const ChipAnimation = () => {
    const playerRef = useRef();

    return (
            <FastImage
                ref={playerRef}
                style={{alignSelf: 'center', width: 200, height: 200, marginHorizontal: -20, marginVertical: -20}}
                source={require('../resources/card-animation.webp')}
            />

    );
};


const Monitor = ({navigation}) => {
    const bigLayout = Platform.isPad,
        dimensions = useWindowDimensions(),
        serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13',
        [discoveredReaders, setDiscoveredReaders] = useState(() => new Object),
        [connectedReaders, setConnectedReaders] = useState(() => new Object),
        [discoveredNamesArray, setDiscoveredNamesArray] = useState(() => []),
        [showingDiscoveredList, setShowingDiscoveredList] = useState(() => false),
        autoConnectByName = useRef(false),
        playerRef = useRef(),
        [listUpdater, setListUpdater] = useState(() => false);

    /*

         Bluetooth info

         Reader advertisement data
         -  Single BLE service
            uuid: 'ab173c6c-8493-412d-897c-1974fa74fc13'
            3 characteristics each with a descriptor:
             'action' - '04CB0EB1-8B58-44D0-91E4-080AF33438BF'
             'status' - '04CB0EB1-8B58-44D0-91E4-080AF33438BD'
             'data' - '04CB0EB1-8B58-44D0-91E4-080AF33438BB'

         Routine:
         -  Subscribes to actions characteristic updates
            When update occurs, update device info with the most
            recent value of all 3 characteristic values
         Data format:
         -  All are JSON-parseable strings
         -  Characteristic values are  are received as base64

    */

    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                manager.startDeviceScan(null,
                    null, (error, device) => {
                        if (error) {
                            console.log(error.message);
                            return;
                        } else if(!device || !device?.name) {
                            return;
                        } else if (device.name.includes('AMS-')) {
                            device.isConnected()
                                .then((connected) => {
                                    try {
                                        // if device is not connected and matches the naming pattern
                                        // this is called every time it is scanned
                                        if (connected) {
                                            throw new Error('Peripheral already connected');
                                        }

                                        if (autoConnectByName.current) {
                                            device.connect()
                                                .then((device) => {
                                                    console.log('Automatically connecting to ', device.name);
                                                    return device.discoverAllServicesAndCharacteristics();
                                                }).then((device) => {
                                                    console.log('Attempting subscription to device action updates');
                                                    return subscribeToService(device);
                                                });
                                        } else {
                                            console.log('Automatic connections disabled, adding to available devices:',
                                                device.name);
                                            updateDiscoveredReaders(device.id, device.name);
                                        }
                                    } catch (error) {
                                        console.log('Device found or error connecting:', error)
                                    }

                                })
                        }
                    });
                subscription.remove();
            }
        }, true);
        return () => subscription.remove();
    }, [manager]);

    const jsonFromBytes = (bytes) => {
        /*  decode base64 string
            encode as ascii
            return parsed object */
        const b64buf = new Buffer(bytes, 'base64');
        const str = b64buf.toString('ascii');
        return JSON.parse(str);
    }

    const updateList = () => setListUpdater(!listUpdater);

    const updateDiscoveredReaders = (id, name) => {
        const alreadyExists = discoveredReaders[id];
        if(!alreadyExists) {
            let tempReaders = discoveredReaders;
            tempReaders[id] = {name: name};
            const tempArray = Array.from(Object.entries(tempReaders)
                .map((item) =>
                    ({key: item[0], label: item[1]['name']})));
            setDiscoveredReaders(tempReaders);
            setDiscoveredNamesArray(tempArray);
        }
    }

    const removeFromDiscovered = (id, name) => {
        let tempDiscovered = discoveredReaders;
        delete tempDiscovered[id];
        const tempDiscoveredArray = Array.from(Object.entries(tempDiscovered)
            .map((item) =>
                ({key: item[0], label: item[1]['name']})));
        setDiscoveredReaders(tempDiscovered);
        setDiscoveredNamesArray(tempDiscoveredArray);
    }

    function isNewInfo(jsonObjA, jsonObjB) {
        if(JSON.stringify(jsonObjA) === JSON.stringify(jsonObjB)) {
            //console.log('duplicates detected:',
            //    JSON.stringify(jsonObjA, null, 4),
            //    '\n',
            //    JSON.stringify(jsonObjB, null, 4));
            return false;
        } else {
            //console.log('unique values detected:',
            //    JSON.stringify(jsonObjA, null, 4),
            //    '\n',
            //    JSON.stringify(jsonObjB, null, 4));
            return true;
        }
    }

    const updateConnectedReaders = (id, name, deviceInfo) => {
        // copy value of connected readers object and
        // update it with the current update values
        const oldInfo = connectedReaders[id];
        const newInfo = {name: name, deviceInfo: deviceInfo};

        if(isNewInfo(oldInfo, newInfo)) {
            let tempConnectedReaders = connectedReaders;
            tempConnectedReaders[id] = {name: name, deviceInfo: deviceInfo};
            setConnectedReaders(tempConnectedReaders);
            updateList();
        }
    }

    const connectToDeviceByID = (deviceID) => {
        manager.connectToDevice(deviceID)
            .then((device) => {
                return device.discoverAllServicesAndCharacteristics();
            }).then((device) => {
                console.log("Attempting subscription to device action updates");
                return subscribeToService(device);
            }).then(
                () => console.log("Subscribed to device action updates"),
                (error) => console.log(error.message)
            )
    }

    const subscribeToService = (device) => {
        removeFromDiscovered(device.id, device.name);
        device.monitorCharacteristicForService(
            serviceUUID,
            '04CB0EB1-8B58-44D0-91E4-080AF33438BF',
            async (error, characteristic) => {
                if (!error && characteristic.value) {
                    try {
                        // read the other 2 characteristics when status update is received
                        const status = await device.readCharacteristicForService(serviceUUID,
                            '04CB0EB1-8B58-44D0-91E4-080AF33438BD');
                        const data = await device.readCharacteristicForService(serviceUUID,
                            '04CB0EB1-8B58-44D0-91E4-080AF33438BB');
                        const update = {
                            'action': jsonFromBytes(characteristic.value),
                            'status': jsonFromBytes(status.value),
                            'data': jsonFromBytes(data.value)
                        };
                        //console.log('update received (' + update['action'] + '):\n',
                        //    JSON.stringify(update['data'], null, 4));
                        updateConnectedReaders(device.id, device.name, update);
                    } catch (error) {
                        console.debug(error);
                    }
                } else {
                    console.debug(error.message)
                }
            });
    }

    const MemoDeviceCard = React.memo(DeviceCard, cardPropsAreEqual);

    function cardPropsAreEqual(prevCard, nextCard) {
        return (
            prevCard['name'] === nextCard['name'] &&
            prevCard['action'] === nextCard['action'] &&
            prevCard['data'] === nextCard['data'] &&
            prevCard['status'] === nextCard['status']
        ) === true;
    }

    const cardStyle = (connectedReaders.size > 1) ?
        {
            width: dimensions.width * 0.25,
            marginLeft: dimensions.width * 0.125,
            marginRight: dimensions.width * 0.125,
        } :
        {

        };

    const ConnectedHeader = ({name}) => (
        <View style={deviceCard.header}>
            <Text style={deviceCard.nameText}>{name}</Text>
            <IconA name='checkcircleo' size={34} style={{color: '#29c436', marginTop: 6}}/>
        </View>
    );

    const DisconnectedHeader = ({name}) => (
        <View style={deviceCard.header}>
            <Text style={deviceCard.nameText}>{name}</Text>
            <ActivityIndicator size={'large'} />
        </View>
    );

    const StatusOKBody = ({action, data}) => {
        console.log('drawing status ok body:\n, ' +
            JSON.stringify({'action':action, 'data':data}));
        if(action === 'status.reportStatus') {
            const readerStatus = data['reader'];
            const {wifi, bt, pico, heater, measurement} = data;
            const remainingTime = measurement?.remainingTime;
            const chipType = measurement?.chipType;
            const reason = measurement?.reason;

            //console.log('status report update drawn for data:\n', JSON.stringify(data, null, 4));

            let component = <View />


            if(chipType === 0) {
                component = <Text style={deviceCard.characteristicText}>
                                The device is ready and waiting for a sample
                            </Text>;
            } else {
                if (pico === 'waiting') {
                    if (reason.toString().includes('Heating')) {
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Please wait while the device warms up
                            </Text>;
                    }
                } else if(pico === 'error') {
                    if (reason) {
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Pico error: {reason.toString()}
                            </Text>;
                    } else
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Pico error
                            </Text>;
                } else if(pico === 'running' || pico === 'idle') {
                    component =
                        <CountdownCircleTimer
                            isPlaying
                            duration={() => {
                                if (chipType === 0) {
                                    return 0;
                                } else if (chipType === 6) {
                                    return 30;
                                } else if (chipType === 7) {
                                    return 1800;
                                } else {
                                    return 1800;
                                }
                            }}
                            initialRemainingTime={remainingTime}
                            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                            colorsTime={[48, 24, 16, 0]}
                        >
                            {({remainingTime}) => <Text>{remainingTime}</Text>}
                        </CountdownCircleTimer>
                }
            }

            return(
                <View style={deviceCard.body}>
                    <View style={deviceCard.utilityBarContainer}>
                        <TouchableOpacity style={deviceCard.utilityBarButton}>
                            <Text style={fonts.mediumText}>Assign patient for next result</Text>
                            <IconF name='user' size={20} style={{color: '#eee', marginTop: 6}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={deviceCard.utilityBarButton}>
                            <Text style={fonts.mediumText}>Disconnect</Text>
                            <IconA name='disconnect' size={20} style={{color: '#eee', marginTop: 6}}/>
                        </TouchableOpacity>
                    </View>
                    {component}
                </View>);
        } else {
            console.log('unhandled action received:', action);

            return <View />;
        }
    }

    function DeviceCard (props) {
        const {name, deviceInfo} = props;
        const {action, status, data} = deviceInfo;
        if (status === 'ok') {
                return (
                    <View style={[deviceCard.container, cardStyle]}>
                        <View style={deviceCard.device}>
                            <ConnectedHeader name={name} />
                            <StatusOKBody action={action} data={data} />
                        </View>
                    </View>
                );
        }

        return (
            <View style={[deviceCard.container, cardStyle]}>
                <View style={deviceCard.device}>
                    <DisconnectedHeader name={name} />
                    <View style={deviceCard.body}>
                        <View style={deviceCard.utilityBarContainer}>
                            <TouchableOpacity style={deviceCard.utilityBarButton}>
                                <Text style={fonts.mediumText}>Assign patient for next result</Text>
                                <IconF name='user' size={20} style={{color: '#eee', marginTop: 6}}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={deviceCard.utilityBarButton}>
                                <Text style={fonts.mediumText}>Disconnect</Text>
                                <IconA name='disconnect' size={20} style={{color: '#eee', marginTop: 6}}/>
                            </TouchableOpacity>
                        </View>
                        <Text style={deviceCard.characteristicText}>
                            Error: {JSON.stringify({
                            'action': action,
                            'status': status,
                            'data': data
                        })}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    const numberOfConnectedDevices = () => { return connectedReaders.size }

    const toggleDiscoveredModal = () => setShowingDiscoveredList(!showingDiscoveredList);

    const numberAvailableDevicesStr = () => {
        if(discoveredNamesArray && discoveredNamesArray.length) {
            if(discoveredNamesArray.length === 1) {
                return '1 available device';
            } else {
                return discoveredNamesArray.length.toString() + ' available devices'
            }
        } else {
            return '0 available devices';
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
                                {numberAvailableDevicesStr()}
                            </Text>
                            <IconE style={fonts.username} size={34}
                                   name={showingDiscoveredList ? 'chevron-up' : 'chevron-down'}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <ModalSelector
                    onChange={(selectedItem) => {
                        connectToDeviceByID(selectedItem.key);
                        setShowingDiscoveredList(false);
                    }}
                    renderItem={<View />}
                    customSelector={<View />}
                    visible={showingDiscoveredList}
                    data={discoveredNamesArray}
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
                <FlatList
                    data={Object.values(connectedReaders)}
                    extraData={[connectedReaders, listUpdater]}
                    renderItem={
                        ({item}) => {
                        console.log(JSON.stringify(item));
                        return <DeviceCard name={item.name} deviceInfo={item.deviceInfo} />
                        }}
                    keyExtractor={(item, index) => item.name}
                />
            </View>
            <UserBar navigation={navigation} />
        </SafeAreaView>
    );
}

export default Monitor;