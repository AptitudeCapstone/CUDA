import React, {useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
    Alert, Dimensions
} from 'react-native';
import {fonts, format, deviceCard, modal, collapsedDeviceCard} from '../style';
import IconE from 'react-native-vector-icons/Entypo';
import IconA from 'react-native-vector-icons/AntDesign';
import ModalSelector from 'react-native-modal-selector-searchable';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import UserBar from '../components/UserBar';
import {useAuth} from '../contexts/UserContext';
import { BleManager } from 'react-native-ble-plx';
import IconF from "react-native-vector-icons/Feather";
import {useIsFocused} from "@react-navigation/native";
import database from "@react-native-firebase/database";

const Buffer = require("buffer").Buffer;
export const manager = new BleManager();

const Monitor = ({navigation}) => {
    const serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13',
        statusCharUUID = '04CB0EB1-8B58-44D0-91E4-080AF33438BD',
        dataCharUUID = '04CB0EB1-8B58-44D0-91E4-080AF33438BB',
        actionCharUUID = '04CB0EB1-8B58-44D0-91E4-080AF33438BF',
        [readersMap, setReadersMap] = useState(() => new Map()),
        [readersArray, setReadersArray] = useState(() => []),
        autoConnectByName = useRef(false),
        dimensions = useWindowDimensions(),
        isFocused = useIsFocused(),
        [selectedTest, setSelectedTest] = useState('covid'),
        [covidPatients, setCovidPatients] = useState([]),
        [fibrinogenPatients, setFibrinogenPatients] = useState([]),
        [viewCOVIDPatientModalVisible, setViewCOVIDPatientModalVisible] = useState(false),
        [viewFibrinogenPatientModalVisible, setViewFibrinogenPatientModalVisible] = useState(false),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        loginStatus = userInfo.loginStatus,
        organization = userInfo.user?.organization,
        patientsPath = ((organization === undefined ?
            '/users/' + auth?.uid :
            '/organizations/' + organization) + '/patients/'),
        patientsRef = database().ref(patientsPath),
        patientTestsPath = patientsPath + '/' + selectedTest + '/results/',
        patientTestDBRef = (testKey) => database().ref(patientTestsPath + testKey),
        databaseDelete = (testKey) =>
            patientTestDBRef(testKey).remove()
                .then(() => console.log('entry removed'))
                .catch(() => {throw new Error('problem removing item from database')});

    // update patient info with most recent patient info
    useEffect(() => {
        if(!auth) {
            setCovidPatients([]);
            setFibrinogenPatients([]);
            return;
        }

        patientsRef.on('value',
            (patientsSnapshot) => {
                if (patientsSnapshot.exists()) {
                    const p = patientsSnapshot.toJSON();
                    const c = Object.keys(p['covid']).map((k) => [k, p['covid'][k]]);
                    setCovidPatients(c);
                    const f = Object.keys(p['fibrinogen']).map((k) => [k, p['fibrinogen'][k]]);
                    setFibrinogenPatients(f);
                } else {
                    setCovidPatients([]);
                    setFibrinogenPatients([]);
                }
            },
            (error) => console.error('Error fetching database updates:', error)
        );

        return () => patientsRef.off();
    }, [auth, organization, loginStatus, selectedTest, isFocused]);

    // useEffect is base of our routine
    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                manager.startDeviceScan(null, null, (error, device) => {
                        if (error || !device || !device?.name) {
                            if(error) console.log(error.message);
                        } else if (device.name.includes('AMS-')) {
                            try {
                                // if device matches the naming pattern
                                // this is called every time it gets scanned
                                if(!readersMap.get(device.id) && autoConnectByName.current) {
                                    connectToDeviceByID(device.id);
                                } else if(!readersMap.get(device.id)) {
                                    // update list of cards but do not connect
                                    updateReaderCards(device.id, {'id': device.id, 'name': device.name});
                                }
                            } catch (error) {
                                console.log('Device connection error:', error)
                            }
                        }
                    });
                subscription.remove();
            }
        }, true);
        return () => subscription.remove();
    }, [manager]);

    const connectToDeviceByID = (deviceID) => {
        // connect and subscribe to updates
        manager.connectToDevice(deviceID)
            .then((device) => device.discoverAllServicesAndCharacteristics())
            .then((device) => subscribeToService(device))
            .then(() => console.log("Subscribed to device action updates"))
    }

    // routine to subscribe to the action characteristic
    const subscribeToService = (device) => {
        function jsonFromBytes(bytes) {
            const b64buf = new Buffer(bytes, 'base64');
            const str = b64buf.toString('ascii');
            return JSON.parse(str);
        }

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
                        console.log('update received: ', action);
                        handleUpdate(device, action, status, data);
                    } catch (error) {
                        console.debug(error);
                    }
                } else {
                    console.debug(error.message)
                }
            });
    }

    // update handler function
    const handleUpdate = (device, action, status, data) => {
        let guiUpdate = false;

        switch(action) {

            case 'status.reportStatus':
                guiUpdate = true;
                console.debug('Status update received');
                break;

            case 'measurement.covid.testStartedSuccessfully':
                guiUpdate = true;
                console.debug('COVID test started successfully');
                break;
            case 'measurement.covid.startedHeating':
                guiUpdate = true;
                console.debug('COVID test, device has started heating', JSON.stringify(data, null, 4))
                break;
            case 'dataProcess.covid.finishedTest':
                guiUpdate = true;
                console.debug('COVID test result received', JSON.stringify(data, null, 4));
                break;

            case 'measurement.fibrinogen.testStartedSuccessfully':
                guiUpdate = true;
                console.debug('Fibrinogen test started successfully');
                break;
            case 'measurement.fibrinogen.testError':
                guiUpdate = true;
                console.debug('Fibrinogen test error', JSON.stringify(data, null, 4));
                break;

            default:
                console.debug('Unrecognized action received', action);
        }

        if(guiUpdate)
            updateReaderCards(device.id, {
                name: device.name,
                id: device.id,
                lastStatus: status,
                lastAction: action,
                lastData: data});
    }

    const updateReaderCards = (id, item) => {
        const tempConnectedReaders = new Map(readersMap);
        tempConnectedReaders.set(id, item);
        setReadersMap(tempConnectedReaders);
        setReadersArray(Array.from(tempConnectedReaders.values()));
    }

    const utilityBarStyle = (dimensions.width < dimensions.height) ? collapsedDeviceCard.utilityBarContainerVertical : collapsedDeviceCard.utilityBarContainerVertical;

    const DiscoveredDeviceCard = React.memo(DiscoveredCard);
    function DiscoveredCard (props) {
        const {id, name} = props;
        return(
        <View style={[deviceCard.container, {flex: 1, justifyContent: 'center', margin: -22,}]}>
            <View style={{flexGrow: 1, padding: 44, width: dimensions.width,}}>
                <View style={collapsedDeviceCard.header}>
                    <View style={collapsedDeviceCard.leftBox}>
                        <IconA name='checkcircleo' size={34} style={{marginRight: 20, alignSelf: 'center', justifyContent: 'center', color: '#eee',}}/>
                        <View style={{justifyContent: 'center', alignContent: 'center'}}>
                            <Text style={collapsedDeviceCard.nameText}>{name}</Text>
                            <Text style={collapsedDeviceCard.statusText}>Not Connected</Text>
                        </View>
                    </View>
                        <View style={utilityBarStyle}>
                            <TouchableOpacity style={collapsedDeviceCard.connectButton}
                                              onPress={() => {connectToDeviceByID(id, name)}}>
                                <Text style={collapsedDeviceCard.connectText}>Connect</Text>
                            </TouchableOpacity>
                        </View>
                </View>
            </View>
        </View>);
    }

    const ExpandedDeviceCard = React.memo(ExpandedCard);
    function ExpandedCard (props) {
        const {id, name, lastAction, lastStatus, lastData} = props;
        if (lastStatus === 'ok') {
            return (
                <View style={[deviceCard.container, {flex: 1, justifyContent: 'center', margin: -22,}]}>
                    <View style={{flexGrow: 1, padding: 44, width: dimensions.width,}}>
                        <View style={collapsedDeviceCard.header}>
                            <View style={collapsedDeviceCard.leftBox}>
                                <IconA name='checkcircleo' size={34} style={{marginRight: 20, alignSelf: 'center', justifyContent: 'center', color: '#29c436',}}/>
                                <View style={{justifyContent: 'center',
                                    alignContent: 'center'}}>
                                    <Text style={collapsedDeviceCard.nameText}>{name}</Text>
                                    <StatusComponent action={lastAction} data={lastData}/>
                                </View>
                            </View>
                                <View style={utilityBarStyle}>
                                    <StatusUtilityBar action={lastAction} data={lastData}/>
                                </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[deviceCard.container, {flex: 1, justifyContent: 'center', margin: -22,}]}>
                    <View style={{flexGrow: 1, padding: 44, width: dimensions.width,}}>
                        <View style={collapsedDeviceCard.header}>
                            <View style={collapsedDeviceCard.leftBox}>
                                <ActivityIndicator size={'large'} style={{alignSelf: 'center'}} />
                                <Text style={collapsedDeviceCard.bigText}>{name}</Text>
                            </View>
                            <View style={collapsedDeviceCard.leftBox}>
                                <Text style={collapsedDeviceCard.statusText}>Error</Text>
                            </View>
                        </View>
                        <View style={deviceCard.body}>
                            <Text style={deviceCard.characteristicText}>
                                Error: {JSON.stringify({'action': lastAction, 'status': lastStatus, 'data': lastData})}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }
    }

    const StatusUtilityBar = ({action, data}) => {
        if(action.includes('covid')) {
            return <TouchableOpacity style={collapsedDeviceCard.utilityBarButton}
                                  onPress={() => {toggleViewCOVIDPatientModal()}}>
                    <Text style={collapsedDeviceCard.utilityButtonText}>Assign COVID patient</Text>
                </TouchableOpacity>;
        } else if(action.includes('fibrinogen')) {
            return <TouchableOpacity style={collapsedDeviceCard.utilityBarButton}
                                  onPress={() => {toggleViewFibrinogenPatientModal()}}>
                    <Text style={collapsedDeviceCard.utilityButtonText}>Assign fibrinogen patient</Text>
                </TouchableOpacity>;
        } else return (<Text></Text>);
    }

    const StatusComponent = ({action, data}) => {
        if(action === 'status.reportStatus') {
            const {wifi, bt, pico, heater, measurement} = data;
            const remainingTime = measurement?.remainingTime;
            const chipType = measurement?.chipType;
            const reason = measurement?.reason;

            let component = <View />;

            if(pico === 'idle') {
                if(!chipType || chipType === '0') component = <Text style={collapsedDeviceCard.statusText}>Idle</Text>;
                else component = <Text style={collapsedDeviceCard.statusText}>The sample can be removed</Text>;
            } else {
                if(reason) {
                    if (pico === 'waiting') {
                        if(reason.toString().includes('heating')) {
                            component = <Text style={collapsedDeviceCard.statusText}>Please wait while the device warms up</Text>;
                        } else if(reason.toString().includes('fluid')) {
                            let abnormalChannels = [];
                            ['C1', 'C2', 'C3', 'C4'].forEach((channel) => {
                                if(reason.toString().includes(channel)) {
                                    abnormalChannels.push(channel);
                                }
                            });
                            component = <>
                                <Text style={collapsedDeviceCard.statusText}>
                                    The device is waiting due to fluid fill on the following channels:
                                    {JSON.stringify(abnormalChannels)}
                                </Text>
                                <Text style={collapsedDeviceCard.statusText}>
                                    {chipType === 7 ? 'COVID' : 'Fibrinogen'} collector detected.
                                    Please insert the capsule into the collector.
                                </Text>
                            </>;
                        } else if(reason.toString().includes('abnormal')) {
                            let abnormalChannels = [];
                            ['C1', 'C2', 'C3', 'C4'].forEach((channel) => {
                                if(reason.toString().includes(channel)) {
                                    abnormalChannels.push(channel);
                                }
                            });
                            component = <Text style={collapsedDeviceCard.statusText}>
                                The device is waiting due to abnormal signals on the following channels:
                                {JSON.stringify(abnormalChannels)}
                            </Text>;
                        }
                    } else if(pico === 'error') {
                        component = <Text style={collapsedDeviceCard.statusText}>Pico error: {reason}</Text>;
                    } else if(pico === 'idle') {
                        component = <Text style={collapsedDeviceCard.statusText}>Sample can be removed</Text>;
                    }
                } else {
                    if(pico === 'error')
                        component = <Text style={collapsedDeviceCard.statusText}>Pico error</Text>;
                    else if(pico === 'running') {
                        const Min = ({result}) => (result[0] === '0' && result[1] !== '0')
                                ? <Text style={{fontSize: 30, fontWeight: 'bold', color: '#eee'}}>
                                    {result[1]} min.</Text>
                                : <Text style={{fontSize: 30, fontWeight: 'bold', color: '#eee'}}>
                                    {result[0] + result[1]} min.</Text>;

                        const Sec = ({result}) => (result[3] === '0' && result[4] !== '0')
                                ? <Text style={{fontSize: 30, fontWeight: 'bold', color: '#eee'}}>
                                    {result[4]} sec.</Text>
                                : <Text style={{fontSize: 30, fontWeight: 'bold', color: '#eee'}}>
                                    {result[3] + result[4]} sec.</Text>;

                        component =
                                <CountdownCircleTimer
                                    isPlaying
                                    strokeWidth={15}
                                    duration={(chipType === 7) ? 1800 : 30}
                                    initialRemainingTime={remainingTime}
                                    colors={['#42f560', '#34c94d', '#2ca340', '#166b25']}
                                    colorsTime={(chipType === 7) ? [1460, 960, 480, 0] : [24, 16, 8, 0]}
                                >
                                    {({remainingTime}) => {
                                        const result = new Date(remainingTime * 1000)
                                            .toISOString().substr(14, 5);
                                        return (<><Min result={result}/><Sec result={result}/></>);
                                    }}
                                </CountdownCircleTimer>
                    }
                }
            }

            return component;
        } else if (action === 'dataProcess.finishedTest') {
            return <Text style={collapsedDeviceCard.statusText}>Result: {JSON.stringify(data, null, 4)}</Text>;
        } else {
            return <Text style={collapsedDeviceCard.statusText}>Unhandled action received: {action}</Text>;
        }
    }

    const selectedPatientChanged = (patientOption) => {
        console.log(patientOption);
    }

    const toggleViewCOVIDPatientModal = () => setViewCOVIDPatientModalVisible(!viewCOVIDPatientModalVisible);
    const toggleViewFibrinogenPatientModal = () => setViewFibrinogenPatientModalVisible(!viewFibrinogenPatientModalVisible);

    return (
        <SafeAreaView style={{flex: 1,}}>
            <View style={format.page}>
                <ModalSelector
                    onChange={(option) => {selectedPatientChanged(option)}}
                    renderItem={<View />}
                    customSelector={<View />}
                    visible={viewCOVIDPatientModalVisible}
                    data={covidPatients}
                    keyExtractor={patient => patient[0]}
                    labelExtractor={patient => patient[1]['name']}
                    onCancel={() => toggleViewCOVIDPatientModal()}
                    cancelText={'Cancel'}
                    searchText={'Search patient by name'}
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
                    onChange={(option) => {selectedPatientChanged(option)}}
                    renderItem={<View />}
                    customSelector={<View />}
                    visible={viewFibrinogenPatientModalVisible}
                    data={fibrinogenPatients}
                    keyExtractor={patient => patient[0]}
                    labelExtractor={patient => patient[1]['name']}
                    onCancel={() => toggleViewFibrinogenPatientModal()}
                    cancelText={'Cancel'}
                    searchText={'Search patient by name'}
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
                    data={readersArray}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => {
                        if(item.lastStatus && item.lastAction) {
                            // render expanded version
                            return <ExpandedDeviceCard id={item.id} name={item.name}
                                                       lastAction={item.lastAction}
                                                       lastStatus={item.lastStatus}
                                                       lastData={item.lastData} />;
                        } else {
                            // render a discovered/unconnected device card
                            return <DiscoveredDeviceCard id={item.id} name={item.name}/>;
                        }
                    }}
                />
            </View>
            <UserBar navigation={navigation} />
        </SafeAreaView>
    );
}

export default Monitor;