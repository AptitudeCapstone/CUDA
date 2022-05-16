import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList, ActivityIndicator
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
        [deviceCardsArray, setDeviceCardsArray] = useState(() => []),
        [showingDiscoveredList, setShowingDiscoveredList] = useState(() => false),
        autoConnectByName = useRef(true),
        playerRef = useRef();

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

    const jsonFromBytes = (bytes) => {
        // decode base64 string
        const b64buf = new Buffer(bytes, 'base64');
        // encode as ascii, return
        const str = b64buf.toString('ascii');
        // parse as object
        return JSON.parse(str);
    }

    async function subscribeToAll(device) {
        device.monitorCharacteristicForService(serviceUUID,
            '04CB0EB1-8B58-44D0-91E4-080AF33438BF',
            async (error, characteristic) => {
                if (!error && characteristic.value) {
                    try {
                        // read the other 2 characteristics when status update is received
                        const status = await device.readCharacteristicForService(serviceUUID,
                            '04CB0EB1-8B58-44D0-91E4-080AF33438BD');
                        const data = await device.readCharacteristicForService(serviceUUID,
                            '04CB0EB1-8B58-44D0-91E4-080AF33438Bb');

                        const update = {
                            'action': jsonFromBytes(characteristic.value),
                            'status': jsonFromBytes(status.value),
                            'data': jsonFromBytes(data.value)
                        };

                        updateConnectedReaders(device.id, device.name, update);
                    } catch (error) {
                        console.debug(error);
                    }
                } else {
                    console.debug(error.message)
                }
        });
    }

    const connectToDevice = (device) => {
        device.connect()
            .then((device) => {
                updateConnectedReaders(device.id, device.name, '{"reader":"fetching data"}');
                console.log("Discovering services and characteristics");
                return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
                console.log("Subscribing to device actions");
                return subscribeToAll(device);
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
                    updateDiscoveredReaders(device.id, device.name,
                        '{"reader":"not connected"}',);

                    if(autoConnectByName.current) {
                        console.log("Found reader", device.name);
                        connectToDevice(device);
                    }
                }
            });
    }

    const updateDiscoveredReaders = (id, name, status) => {
        let tObj = discoveredReaders;
        tObj[id] = {name: name, status: status};

        if(JSON.stringify(tObj[id]) !== JSON.stringify(discoveredReaders[id])) {
            setDiscoveredReaders(tObj);
        }

        let tArray = Array.from(Object.entries(discoveredReaders)
            .map((key, val) => (({
                id: key,
                name: val.name
            })))
        );

        if(JSON.stringify(tArray) !== JSON.stringify(discoveredNamesArray)) {
            setDiscoveredNamesArray(tArray);
        }

        console.log('discovered readers array:', tArray);

        /*
        console.log('newest connected readers data:',
            JSON.stringify(tObj, null, 4)
            , '\n\n\n');
         */
    }

    const updateConnectedReaders = (id, name, deviceInfo) => {
         // copy value of object and update it
        let tObj = connectedReaders;
        tObj[id] = {name: name, deviceInfo: deviceInfo};
        if(JSON.stringify(tObj[id]) !== JSON.stringify(connectedReaders[id])) {
            setConnectedReaders(tObj);
        }

        let tArray = Array.from(Object.entries(connectedReaders)
                    .map((item) =>
                        ({
                            id: item[0],
                            name: item[1]['name'],
                            deviceInfo: item[1]['deviceInfo'],
                        })
                    )
        );

        if(JSON.stringify(tArray) !== JSON.stringify(deviceCardsArray)) {
            setDeviceCardsArray(tArray);
            //console.log(JSON.stringify(tArray, null, 4));
        }

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

    function DeviceCard (props) {
        const {name, action, status, data} = props;
        const selectedPatient = "Noah";

        const err = (!name || !action || !status || !data || data['reader'] === '{}');

        if(err) {
            // reader is initializing, hasnt sent update yet, corrupt update received, etc.
            return (
                <View style={[deviceCard.container, cardStyle]}>
                    <View style={deviceCard.device}>
                        <View style={deviceCard.header}>
                            <Text style={deviceCard.nameText}>{name}</Text>
                            <ActivityIndicator size={'large'}/>
                        </View>
                        <View style={deviceCard.body}>
                            <View style={deviceCard.utilityBarContainer}>
                                <TouchableOpacity style={deviceCard.utilityBarButton}>
                                    <Text style={fonts.mediumText}>Assign patient for next result</Text>
                                    <IconF name='user' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                            </View>
                            <Text style={deviceCard.characteristicText}>
                                Attempting to reconnect
                            </Text>
                        </View>
                    </View>
                </View>
            );
        } else {
            const infoStr = JSON.stringify({
                    'action':action,
                    'status:':status,
                    'data':data},
                null,
                4);

            console.log('rendering device card for device ' + name + ' with info: \n' +
                infoStr
            );

            if(status === 'ok') {
                const reader = data['reader'];
                const {wifi, bt, pico, heater, measurement} = data;
                const remainingTime = measurement?.remainingTime;
                const chipType = measurement?.chipType;
                const reason = measurement?.reason;

                if(reader === 'idle') {
                    return (
                        <View style={[deviceCard.container, cardStyle]}>
                            <View style={deviceCard.device}>
                                <View style={deviceCard.header}>
                                    <Text style={deviceCard.nameText}>{name}</Text>
                                    <IconA name='checkcircleo' size={34} style={{color: '#29c436', marginTop: 6}}/>
                                </View>
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
                                        The device is ready and waiting for a sample
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                } else if(reader === 'running') {
                    if(remainingTime) {
                        if(pico === 'waiting') {
                            if(reason.toString().includes('Heating')) {
                                return(
                                    <Text style={deviceCard.characteristicText}>
                                        Please wait while the device warms up
                                    </Text>
                                );
                            }
                        } else {
                            return (
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
                            );
                        }
                    } else {
                        return (
                            <Text style={deviceCard.characteristicText}>{'chip type: ' + chipType + ', \ntime remaining: ' +
                            remainingTime + ', \npico status: ' + pico}</Text>
                        );
                    }
                }
            } else {
                // reader status is not ok (means error state on reader)
                return (
                    <View style={[deviceCard.container, cardStyle]}>
                        <View style={deviceCard.device}>
                            <View style={deviceCard.header}>
                                <Text style={deviceCard.nameText}>{name}</Text>
                            </View>
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
                                    Error: {JSON.stringify(status)}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            }
        }
    }

    const toggleDiscoveredModal = () => setShowingDiscoveredList(!showingDiscoveredList);

    const PeripheralList = () => (
            <FlatList
                horizontal={true}
                data={deviceCardsArray}
                extraData={deviceCardsArray}
                renderItem={({item}) =>
                    <MemoDeviceCard
                        name={item['name']}
                        action={item['deviceInfo']['action']}
                        status={item['deviceInfo']['status']}
                        data={item['deviceInfo']['data']}
                    />
                }
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
                                label: value
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