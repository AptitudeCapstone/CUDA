import React, {useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList, ActivityIndicator, VirtualizedList, ScrollView, Alert
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



const Monitor = ({navigation}) => {
    const serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13',
        statusCharUUID = '04CB0EB1-8B58-44D0-91E4-080AF33438BD',
        dataCharUUID = '04CB0EB1-8B58-44D0-91E4-080AF33438BB',
        actionCharUUID = '04CB0EB1-8B58-44D0-91E4-080AF33438BF',
        [discoveredReaders, setDiscoveredReaders] = useState(new Map()),
        [connectedReaders, setConnectedReaders] = useState(new Map()),
        [discoveredNamesArray, setDiscoveredNamesArray] = useState(() => []),
        [showingDiscoveredList, setShowingDiscoveredList] = useState(() => false),
        [listUpdater, setListUpdater] = useState(() => false),
        autoConnectByName = useRef(true),
        bigLayout = Platform.isPad,
        dimensions = useWindowDimensions();


    /*
         Reader advertisement data
         -  Single BLE service
            uuid: 'ab173c6c-8493-412d-897c-1974fa74fc13'
            3 characteristics each with a descriptor: action, status, data
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
                        if (error || !device || !device?.name) {
                            if(error) console.log(error.message);
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
            actionCharUUID,
            async (error, characteristic) => {
                if (!error && characteristic.value) {
                    try {
                        // read the other 2 characteristics when status update is received
                        const statusRes = await device.readCharacteristicForService(serviceUUID, statusCharUUID);
                        const dataRes = await device.readCharacteristicForService(serviceUUID, dataCharUUID);
                        const action = jsonFromBytes(characteristic.value);
                        const status = jsonFromBytes(statusRes.value);
                        const data = jsonFromBytes(dataRes.value);
                        const update = {'action': action, 'status': status, 'data': data};

                        //console.log('update received:\n', JSON.stringify(update, null, 4));

                        if(action === 'dataProcess.finishedTest') {
                            Alert.alert('Test result received', JSON.stringify(update['data'], null, 4))
                        }

                        const tempConnectedReaders = new Map(connectedReaders);
                        tempConnectedReaders[device.id] = {name: device.name, lastUpdate: update};
                        setConnectedReaders(tempConnectedReaders);
                        updateList();
                    } catch (error) {
                        console.debug(error);
                    }
                } else {
                    console.debug(error.message)
                }
            });
    }

    const MemoDeviceCard = React.memo(DeviceCard,
        (prevCard, nextCard) =>
            (prevCard['name'] === nextCard['name'] &&
            prevCard['lastUpdate'] === nextCard['lastUpdate']) === true
    );

    const cardStyle = (connectedReaders.size > 1) ?
        {
            width: dimensions.width * 0.25,
            marginLeft: dimensions.width * 0.125,
            marginRight: dimensions.width * 0.125,
        } : {};

    const ConnectedHeader = ({name}) => (
        <View style={deviceCard.header}>
            <View style={{flexDirection: 'row', alignContent: 'center'}}>
                <IconA name='checkcircleo' size={34} style={{marginRight: 20, alignSelf: 'center', justifyContent: 'center', color: '#29c436',}}/>
                <Text style={deviceCard.nameText}>{name}</Text>
            </View>
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
            const {wifi, bt, pico, heater, measurement} = data;
            const remainingTime = measurement?.remainingTime;
            const chipType = measurement?.chipType;
            const reason = measurement?.reason;

            //console.log('status report update drawn for data:\n', JSON.stringify(data, null, 4));

            let component = <View />;
            let colors = {

            }

            if(chipType === 0) {
                component =
                    <Text style={deviceCard.characteristicText}>
                        The reader is waiting for a new sample
                    </Text>;
            } else {
                if(reason) {
                    if (pico === 'waiting') {
                        if(reason.toString().includes('Heating')) {
                            component =
                                <Text style={deviceCard.characteristicText}>
                                    Please wait while the device warms up
                                </Text>;
                        } else if(reason.toString().includes('Fluid')) {
                            let abnormalChannels = [];
                            ['C1', 'C2', 'C3', 'C4'].forEach((channel) => {
                                if(reason.toString().includes(channel)) {
                                    abnormalChannels.push(channel);
                                }
                            });

                            component =
                                <View>
                                    <Text style={deviceCard.characteristicText}>
                                        The device is waiting due to fluid fill on channels:
                                        {JSON.stringify(abnormalChannels)}
                                    </Text>
                                    <Text style={deviceCard.characteristicText}>
                                        {chipType === 7 ? 'COVID' : 'Fibrinogen'} collector detected.
                                        Please insert the capsule into the collector.
                                    </Text>
                                </View>;
                        } else if(reason.toString().includes('abnormal')) {
                            let abnormalChannels = [];
                            ['C1', 'C2', 'C3', 'C4'].forEach((channel) => {
                                if(reason.toString().includes(channel)) {
                                    abnormalChannels.push(channel);
                                }
                            });

                            component =
                                <Text style={deviceCard.characteristicText}>
                                    The device is waiting due to abnormal channels:
                                    {JSON.stringify(abnormalChannels)}
                                </Text>;
                        }
                    } else if(pico === 'error') {
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Pico error: {reason}
                            </Text>;
                    } else if(pico === 'idle') {
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Sample can be removed
                            </Text>;
                    }
                } else {
                    if(pico === 'error')
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Pico error
                            </Text>;
                    else if(pico === 'running')
                        component =
                            <CountdownCircleTimer
                                isPlaying
                                duration={(chipType === 7) ? 1800 : 30}
                                initialRemainingTime={remainingTime}
                                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                                colorsTime={[48, 24, 16, 0]}
                            >
                                {({remainingTime}) => <Text>{remainingTime}</Text>}
                            </CountdownCircleTimer>
                    else if(pico === 'idle') {
                        component =
                            <Text style={deviceCard.characteristicText}>
                                Starting a new test
                            </Text>;
                    }
                }
            }

            return(
                <View style={deviceCard.body}>
                    {component}
                </View>);
        } else if (action === 'dataProcess.finishedTest') {
            return(
                <View style={deviceCard.body}>
                    <Text style={deviceCard.characteristicText}>
                        Result: {JSON.stringify(data, null, 4)}
                    </Text>
                </View>);
        } else {
            return(
                <View style={deviceCard.body}>
                    <Text style={deviceCard.characteristicText}>
                        Unhandled action received: {action}
                    </Text>
                </View>);
        }
    }

    function DeviceCard (props) {
        const {name, lastUpdate} = props;
        const {action, status, data} = lastUpdate;

        if (status === 'ok') {
                return (
                    <View style={[deviceCard.container, {
                        flex: 1,
                        justifyContent: 'center',
                        margin: -22,
                    }]}>
                        <View style={{flexGrow: 1,padding:44,width: dimensions.width,}}>
                            <ConnectedHeader
                                style={{width: dimensions.width}}
                                name={name} />
                            <StatusOKBody
                                style={{width: dimensions.width}}
                                action={action} data={data} />
                        </View>
                    </View>
                );
        }

        return (
            <View style={[deviceCard.container, {padding: 20, margin: 20, }]}>
                <View style={[{width: dimensions.width * 0.8, height: dimensions.height * 0.66}]}>
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
                    snapToAlignment={'top'}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 90 }}
                    pagingEnabled={true}
                    decelerationRate={'fast'}
                    data={Object.values(connectedReaders)}
                    keyExtractor={(item) => item.name}
                    renderItem={
                        ({item}) => {
                        console.log(JSON.stringify(item));
                        return <MemoDeviceCard name={item.name} lastUpdate={item.lastUpdate} />
                        }}
                />
            </View>
            <UserBar navigation={navigation} />
        </SafeAreaView>
    );
}

export default Monitor;