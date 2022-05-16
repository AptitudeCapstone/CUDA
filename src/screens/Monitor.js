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
const Buffer = require("buffer").Buffer;
import { BleManager } from 'react-native-ble-plx';
import IconF from "react-native-vector-icons/Feather";

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
        autoConnectByName = useRef(false),
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

     async function subscribe(device) {
            device.monitorCharacteristicForService(serviceUUID, '04CB0EB1-8B58-44D0-91E4-080AF33438BA', (error, characteristic) => {
                if (!error && characteristic.value) {
                    // convert from base64 -> ascii -> json object as map
                    const bytes = characteristic.value;
                    const b64buf = new Buffer(bytes, 'base64');
                    const aStr = b64buf.toString('ascii');
                    try {
                        console.log('json str:', aStr);
                        const jObj = JSON.parse(aStr);
                        updateConnectedReaders(device.id, device.name, jObj);
                    } catch(error) {
                        console.debug('invalid json packet received')
                    }
                } else {
                    console.log(error.message)
                }
            })
    }

    const connectToDevice = (device) => {
        device.connect()
            .then((device) => {
                updateConnectedReaders(device.id, device.name, '{"reader":"fetching data"}');
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
                    updateDiscoveredReaders(device.id, device.name, '{"reader":"not connected"}');

                    if(autoConnectByName) {
                        console.log("Found reader to reader", device.name);
                        connectToDevice(device);
                    }
                }
            });
    }

    const updateDiscoveredReaders = (id, name, statuses) => {
        let tObj = discoveredReaders;
        tObj[id] = {name: name, statuses: statuses};
        if(JSON.stringify(tObj[id]) !== JSON.stringify(discoveredReaders[id])) {
            setDiscoveredReaders(tObj);
        }

        let tArray = Array.from(Object.entries(discoveredReaders)
            .map((key, val) => (({
                id: key,
                name: val.name})))
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

    const updateConnectedReaders = (id, name, statuses) => {
         // copy value of object and update it
        let tObj = connectedReaders;
        tObj[id] = {name: name, statuses: statuses};
        if(JSON.stringify(tObj[id]) !== JSON.stringify(connectedReaders[id])) {
            setConnectedReaders(tObj);
        }


        console.log('newest connected readers data:',
            JSON.stringify(tObj, null, 4)
            , '\n\n\n================\n\n\n');

        let tArray = Array.from(
                        Object.entries(connectedReaders)
                    .map(
                        (item) => ({
                        id: item[0],
                        name: item[1]['name'],
                        statuses: item[1]['statuses']}))
        );

        if(JSON.stringify(tArray) !== JSON.stringify(deviceCardsArray)) {
            setDeviceCardsArray(tArray);
        }

    }

    /*
        covid heating
        {"status":"ok","data":{"wifi":"client","bt":"running","pico":"waiting","heater":"ready","measurement":{"remainingTime":1800,"started":true,"reason":"Wait for Heating to 65"},"reader":"running"},"action":"status.getModuleStatus"}

        covid running
        {"status":"ok","data":{"wifi":"client","bt":"running","pico":"running","heater":"ready","measurement":{"remainingTime":1794.8793834239987,"started":true,"reason":null},"reader":"running"},"action":"status.getModuleStatus"}

        covid finished

     */

    const MemoDeviceCard = React.memo(DeviceCard, cardPropsAreEqual);

    function cardPropsAreEqual(prevCard, nextCard) {
        return prevCard['action'] === nextCard['action']
            && prevCard['data'] === nextCard['data'];
    }

    function DeviceCard (props) {
        const {name, statuses} = props;
        const selectedPatient = "Noah";
        const ref = useRef(null);


        const cardStyle = (connectedReaders.size > 1) ?
            {
                width: dimensions.width * 0.25,
                marginLeft: dimensions.width * 0.125,
                marginRight: dimensions.width * 0.125,
            } :
            {

            };

        const ComponentForDeviceState = () => {
            const reader = statuses['reader'];

            if(reader === 'not connected' || reader === 'fetching data')
                return;

            const {wifi, bt, pico, heater, measurement} = statuses;
            const remainingTime = measurement?.remainingTime;
            const chipType = measurement?.chipType;
            const reason = measurement?.reason;

                console.log('\n\n\nwifi:', wifi);
                console.log('bt:', bt);
                console.log('pico:', pico);
                console.log('heater:', heater);
                console.log('remainingTime:', remainingTime);
                console.log('chipType:', chipType);
                console.log('reason:', reason);
                console.log('reader:', reader);
                console.log('\n\n\n');

                //console.log(JSON.stringify(data, null, 4));
                if(reader === 'idle') {
                    return(
                        <Text style={deviceCard.characteristicText}>
                            The device is ready and waiting for a sample
                        </Text>
                    );
                } else {

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
                                            return 300;
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


            return (
                <View>
                    <Text style={deviceCard.characteristicText}>
                        Attempting to reconnect
                    </Text>
                    <ActivityIndicator size={'large'} />
                </View>
            );
        }

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
                        <ComponentForDeviceState />
                    </View>
                </View>
            </View>
        );
    }

    const toggleDiscoveredModal = () => setShowingDiscoveredList(!showingDiscoveredList);

    const PeripheralList = () => (
            <FlatList
                horizontal={true}
                data={deviceCardsArray}
                extraData={deviceCardsArray}
                renderItem={({item}) => <DeviceCard name={item['name']} statuses={item['statuses']} />}
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