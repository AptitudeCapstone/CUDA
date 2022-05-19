import React, {useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {fonts, format, modal, device} from '../style';
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
                .catch(() => {
                    throw new Error('problem removing item from database')
                });

    // this useEffect is the base of the patient database routine
    useEffect(() => {
        if (!auth) {
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

    // this useEffect is base of the BLE routine
    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                manager.startDeviceScan(null, null, (error, device) => {
                    if (error || !device || !device?.name) {
                        if (error) console.log(error.message);
                    } else if (device.name.includes('AMS-')) {
                        // if device matches the naming pattern
                        // this is called every time it gets scanned
                        try {
                            if (!readersMap.get(device.id) && autoConnectByName.current) {
                                // connect to device if autoconnect on
                                connect(device.id);
                            } else if (!readersMap.get(device.id)) {
                                // update list of cards but do not connect
                                updateReaderCards({id: device.id, name: device.name});
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

    // connect device and subscribe to updates by ID
    const connect = (deviceID) => {
        manager.connectToDevice(deviceID)
            .then((device) => device.discoverAllServicesAndCharacteristics())
            .then((device) => subscribe(device))
            .then(() => console.log("Subscribed to device action updates"))
    }

    function jsonFromBytes(bytes) {
        const b64buf = new Buffer(bytes, 'base64');
        const str = b64buf.toString('ascii');
        return JSON.parse(str);
    }

    // subscribe to the action characteristic
    const subscribe = (device) => {
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

    // characteristic update handler function
    // received when a new action value is received from the device
    const handleUpdate = (device, action, status, data) => {
        switch (action) {
            case 'status.reportStatus':
                console.debug('Status update received');
                updateReaderCards({name: device.name, id: device.id,
                                       lastStatus: status, lastAction: action, lastData: data});
                break;

            case 'measurement.covid.testStartedSuccessfully':
                console.debug('COVID test started successfully');
                break;
            case 'measurement.covid.startedHeating':
                console.debug('COVID test, device has started heating', JSON.stringify(data, null, 4))
                break;
            case 'dataProcess.covid.finishedTest':
                console.debug('COVID test result received', JSON.stringify(data, null, 4));
                break;

            case 'measurement.fibrinogen.testStartedSuccessfully':
                console.debug('Fibrinogen test started successfully');
                break;
            case 'measurement.fibrinogen.testError':
                console.debug('Fibrinogen test error', JSON.stringify(data, null, 4));
                break;

            default:
                console.debug('Unrecognized action received', action);
        }
    }

    // helper function to update the visible cards
    const updateReaderCards = (item) => {
        const tempConnectedReaders = new Map(readersMap);
        tempConnectedReaders.set(item.id, item);

        if(JSON.stringify(readersMap) !== tempConnectedReaders) {
            setReadersMap(tempConnectedReaders);
        }

        const tempArray = Array.from(tempConnectedReaders.values());
        if (JSON.stringify(tempArray) !== JSON.stringify(readersArray)) {
            setReadersArray(tempArray);
        }
    }

    const isLandscape = (dimensions.width > dimensions.height);
    const utilityBarStyle = isLandscape ? device.utilityBarContainerVertical : device.utilityBarContainerHorizontal;
    const headerStyle = isLandscape ? {flexDirection: 'row'} : {flexDirection: 'column'};
    const toggleViewCOVIDPatientModal = () => setViewCOVIDPatientModalVisible(!viewCOVIDPatientModalVisible);
    const toggleViewFibrinogenPatientModal = () => setViewFibrinogenPatientModalVisible(!viewFibrinogenPatientModalVisible);
    const selectedPatientChanged = (patientOption) => {
        console.log(patientOption);
    }

    // define behavior of discovered but not connected reader display card
    function DiscoveredReader(props) {
        const {id, name} = props;
        return (
            <View style={device.container}>
                <View style={{flexGrow: 1, }}>
                    <View style={[device.header, headerStyle]}>
                        <View style={device.leftBox}>
                            <IconA name='checkcircleo' size={34} style={device.discoveredIcon}/>
                            <View style={{justifyContent: 'center', alignContent: 'center'}}>
                                <Text style={device.nameText}>{name}</Text>
                                <Text style={device.statusText}>Discovered</Text>
                            </View>
                        </View>
                        <View style={utilityBarStyle}>
                            <TouchableOpacity style={device.utilityBarButton} onPress={() => {connect(id, name)}}>
                                <Text style={device.utilityButtonText}>Connect</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>);
    }
    const DiscoveredReaderMemo = React.memo(DiscoveredReader);

    // define behavior of connected reader display card
    const getStatus = (action, data) => {
        let statusText = '';

        if (action === 'status.reportStatus') {
            const {wifi, bt, pico, heater, measurement} = data;
            const remainingTime = measurement?.remainingTime;
            const chipType = measurement?.chipType;
            const reason = measurement?.reason;
            const allChannels = ['C1', 'C2', 'C3', 'C4'];

            if (pico === 'idle') {
                if (!chipType || chipType === '0')
                    statusText = 'Idle';
                else
                    statusText = 'Test is starting';
            } else if (pico === 'waiting') {
                if(reason) {
                    if (reason.toString().includes('heating')) {
                        statusText = 'Please wait while the device warms up';
                    } else if (reason.toString().includes('fluid')) {
                        statusText = (chipType === 7 ? 'COVID' : 'Fibrinogen')
                                    + '\nFluid fill channels:\n';
                        allChannels.forEach((channel) => {
                            if (reason.toString().includes(channel)) statusText += channel;
                        });
                    } else if (reason.toString().includes('abnormal')) {
                        statusText = (chipType === 7 ? 'COVID' : 'Fibrinogen')
                                    + '\nAbnormal scan channels\n';
                        allChannels.forEach((channel) => {
                            if (reason.toString().includes(channel)) statusText += channel;
                        });
                    } else {
                        statusText = reason.toString();
                    }
                } else {
                    statusText = 'Pico waiting';
                }
            } else if (pico === 'error') {
                if(reason) {
                    statusText = 'Pico error: ' + reason;
                } else {
                    statusText = 'Pico error';
                }
            }
        }

        return statusText;
    }

    function ConnectedReader(props) {
        const {id, name, lastAction, lastStatus, lastData} = props;
        const statusText = getStatus(lastAction, lastData);

        const UtilityButtons = ({statusText}) => {
            if (statusText.includes('COVID')) {
                return(
                    <TouchableOpacity style={device.utilityBarButton}
                                             onPress={() => {toggleViewCOVIDPatientModal()}}>
                        <Text style={device.utilityButtonText}>Assign COVID patient</Text>
                    </TouchableOpacity>);
            } else if(statusText.includes('Fibrinogen')) {
                return(
                    <TouchableOpacity style={device.utilityBarButton}
                                             onPress={() => {toggleViewFibrinogenPatientModal()}}>
                        <Text style={device.utilityButtonText}>Assign fibrinogen patient</Text>
                    </TouchableOpacity>);
            } else return <View />;
        }

            return (
                <View style={device.container}>
                    <View style={{flexGrow: 1, }}>
                        <View style={[device.header, headerStyle]}>
                            <View style={device.leftBox}>
                                <IconA name='checkcircleo' size={34} style={device.connectedIcon}/>
                                <View style={{justifyContent: 'center', alignContent: 'center'}}>
                                    <Text style={device.nameText}>{name}</Text>
                                    <Text style={[device.statusText, {color: '#1c9c27'}]}>
                                        {statusText}
                                    </Text>
                                </View>
                            </View>
                            <View style={utilityBarStyle}>
                                <UtilityButtons statusText={statusText} />
                            </View>
                        </View>
                    </View>
                </View>
            );
    }

    const ConnectedReaderMemo = React.memo(ConnectedReader);

    const PatientSelector = ({testType}) =>
        <ModalSelector
            onChange={(option) => {selectedPatientChanged(option)}}
            renderItem={<View />}
            customSelector={<View />}
            visible={
                (testType === 'covid')
                    ? viewCOVIDPatientModalVisible
                    : viewFibrinogenPatientModalVisible
            }
            data={
                (testType === 'covid')
                    ? covidPatients
                    : fibrinogenPatients
            }
            keyExtractor={patient => patient[0]}
            labelExtractor={patient => patient[1]['name']}
            onCancel={() =>
                (testType === 'covid')
                    ? toggleViewCOVIDPatientModal()
                    : toggleViewFibrinogenPatientModal()
            }
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
        />;


    return (
        <SafeAreaView style={format.safeArea}>
            <View style={format.page}>
                <PatientSelector testType={'covid'} />
                <PatientSelector testType={'fibrinogen'} />
                <FlatList
                    data={readersArray}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => {
                        if(item.lastStatus && item.lastAction) {
                            // render expanded version
                            return <ConnectedReaderMemo id={item.id} name={item.name}
                                                        lastAction={item.lastAction}
                                                        lastStatus={item.lastStatus}
                                                        lastData={item.lastData} />;
                        } else {
                            // render a discovered/unconnected device card
                            return <DiscoveredReaderMemo id={item.id} name={item.name}/>;
                        }
                    }}
                />
            </View>
            <UserBar userInfo={useAuth} navigation={navigation} />
        </SafeAreaView>
    );
}

export default Monitor;