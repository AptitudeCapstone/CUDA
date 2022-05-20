import React, {useEffect, useRef, useState} from 'react';
import {
    useWindowDimensions,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Alert,
} from 'react-native';
import {fonts, format, modal, device} from '../style';
import IconA from 'react-native-vector-icons/AntDesign';
import ModalSelector from 'react-native-modal-selector-searchable';
import UserBar from '../components/UserBar';
import {useAuth} from '../contexts/UserContext';
import {BleManager} from 'react-native-ble-plx';
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
        [readerToPatientMap, setReaderToPatientMap] = useState(() => new Map()),
        [readerToPatientArray, setRreaderToPatientArray] = useState(() => []),
        [lastTappedDeviceForPatientSelect, setLastTappedDeviceForPatientSelect] = useState(null),
        autoConnectByName = useRef(false),
        dimensions = useWindowDimensions(),
        isFocused = useIsFocused(),
        [covidPatients, setCovidPatients] = useState([]),
        [fibrinogenPatients, setFibrinogenPatients] = useState([]),
        [viewCOVIDPatientModalVisible, setViewCOVIDPatientModalVisible] = useState(false),
        [viewFibrinogenPatientModalVisible, setViewFibrinogenPatientModalVisible] = useState(false),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        loginStatus = userInfo.loginStatus,
        organization = userInfo.user?.organization,
        patientsPath = ((organization === undefined
            ? '/users/' + auth?.uid
            :  '/organizations/' + organization) + '/patients/'),
        patientsRef = database().ref(patientsPath),
        isLandscape = (dimensions.width > dimensions.height);

    // this useEffect is the base of the patient database routine
    useEffect( () => {
        if (auth) {
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
        } else {
            setCovidPatients([]);
            setFibrinogenPatients([]);
            return () => console.debug('User is logged off');
        }
    }, [auth, organization, loginStatus, isFocused]);

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
                                updateReaderCards({id: device.id, name: device.name,
                                                       statusText: 'Discovered', isConnected: false});
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
            .then((device) => {
                subscribe(device);
                const tempConnectedReaders = new Map(readersMap);
                tempConnectedReaders.delete(deviceID);
                tempConnectedReaders.set(deviceID, {
                    name: device.name,
                    id: device.id,
                    statusText: 'Idle',
                    isConnected: true,
                    color: 'default'
                });
                setReadersMap(tempConnectedReaders);
                const tempArray = Array.from(tempConnectedReaders.values());
                setReadersArray(tempArray);
                console.log("Subscribed to device action updates");
            })
    }

    const disconnectFromDevice = (deviceID) => {
        const tempConnectedReaders = new Map(readersMap);
        tempConnectedReaders.delete(device.id);
        setReadersMap(tempConnectedReaders);
        const tempArray = Array.from(tempConnectedReaders.values());
        setReadersArray(tempArray);

        manager.cancelDeviceConnection(deviceID)
            .then((device) => console.log("Disconnected from ", device.name))
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
                        const actionRes = await  device.readCharacteristicForService(serviceUUID, actionCharUUID);
                        const statusRes = await device.readCharacteristicForService(serviceUUID, statusCharUUID);
                        const dataRes = await device.readCharacteristicForService(serviceUUID, dataCharUUID);
                        const action = jsonFromBytes(actionRes.value);
                        const status = jsonFromBytes(statusRes.value);
                        const data = jsonFromBytes(dataRes.value);
                        console.log('update received: ', JSON.stringify({'status': status, 'action': action, 'data': data}));
                        handleUpdate(device, action, status, data);
                    } catch (error) {
                        console.debug(error);
                    }
                } else {
                    console.debug(error.message);
                    updateReaderCards({
                        name: device.name,
                        id: device.id,
                        statusText: 'Discovered',
                        isConnected: false
                    });
                }
            });
    }


    // BLE update handler function
    const handleUpdate = (device, action, status, data) => {
        let patientSelectedForReader = readerToPatientMap[device.id];
        console.log(readerToPatientMap);
        if(!patientSelectedForReader) patientSelectedForReader = 'guest';
        let covidDBRef = database().ref(patientsPath + '/covid/' + patientSelectedForReader + '/results/');
        let fibrinogenDBRef = database().ref(patientsPath + '/fibrinogen/' + patientSelectedForReader + '/results/');

        switch (action) {
            // card turns green
            // time remaining text set to initial test time
            case 'measurement.covid.startedHeating':
                console.debug('COVID test, device has started heating', JSON.stringify(data, null, 4))
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'green',
                    utilityBar: 'covid',  statusText: 'Device is warming up'
                });
                break;

            // card remains green
            // time remaining text set to initial test time
            case 'measurement.covid.testStartedSuccessfully':
                console.debug('COVID test started successfully');
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'green',
                    utilityBar: 'covid',  statusText: 'Test in progress'
                });
                break;

            // card remains green
            // time remaining text set to initial test time
            case 'status.covidSecondsRemaining':
                const covidTimeRemaining = new Date(data * 1000).toISOString().substr(14, 5);
                const covidMin = (covidTimeRemaining[0] === '0' && covidTimeRemaining[1] !== '0')
                    ? covidTimeRemaining[1] + ' min. '
                    :  covidTimeRemaining[0] + covidTimeRemaining[1] + 'min. ';
                const covidSec = (covidTimeRemaining[3] === '0' && covidTimeRemaining[4] !== '0')
                    ? covidTimeRemaining[4] + 'sec.'
                    : covidTimeRemaining[3] + covidTimeRemaining[4] + ' sec.';
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'green',
                    utilityBar: 'covid',  statusText: covidMin + covidSec + ' remaining'
                });
                break;

            // card turns orange
            // message is displayed to the user describing the error
            case 'measurement.covid.testError':
                console.debug('COVID test error', JSON.stringify(data, null, 4));
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'orange',
                    utilityBar: 'covid',  statusText: 'An error occurred while testing'
                });
                break;

            // card turns light green
            // result is uploaded to patient database of current user
            // if no patient assigned, uploads to guest results
            case 'dataProcess.covid.finishedTest':
                const covidResult = {result: data, time: new Date().getDate()};
                console.log('db ref for covid result:', covidDBRef, 'and result:\n', covidResult);
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'light-green',
                    utilityBar: 'covid',  statusText: 'Test complete with result ' + data
                });
                Alert.alert('Uploading COVID result', JSON.stringify(covidResult, null, 4));
                break;

            // card turns green
            // time remaining text set to initial test time
            case 'measurement.fibrinogen.testStartedSuccessfully':
                console.debug('Fibrinogen test started');
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'green',
                    utilityBar: 'fibrinogen',  statusText: 'Fibrinogen test in progress'
                });
                break;

            // card remains green
            // time remaining text updates
            case 'status.fibrinogenSecondsRemaining':
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'green',
                    utilityBar: 'fibrinogen',  statusText: data + ' sec. remaining'
                });
                break;

            // card turns orange
            // message is displayed to the user describing the error
            case 'measurement.fibrinogen.testError':
                console.debug('Fibrinogen test error', JSON.stringify(data, null, 4))
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'orange',
                    utilityBar: 'fibrinogen',  statusText: 'An error occurred while testing'
                });
                break;

            // card turns light green
            // result is uploaded to patient database of current user
            // if no patient assigned, uploads to guest results
            case 'dataProcess.fibrinogen.finishedTest':
                const fibrinogenResult = {result: data, time: new Date().getDate()};
                //dbRef.push(result);
                console.log('db ref for fibrinogen result:', fibrinogenDBRef, 'and result:\n', fibrinogenResult);
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true, color: 'light-green',
                    utilityBar: 'fibrinogen',  statusText: 'Test complete with result ' + data.value
                });
                //Alert.alert('Uploading fibrinogen result', JSON.stringify(data, null, 4));
                break;

            // for debugging, alert the action used that was not handled
            default:
                Alert.alert('Unrecognized action received', JSON.stringify(action));
        }
    }

    // helper function to update the visible cards
    const updateReaderCards = (item) => {
        const tempConnectedReaders = new Map(readersMap);
        tempConnectedReaders.set(item.id, item);

        if (JSON.stringify(readersMap) !== JSON.stringify(tempConnectedReaders)) {
            setReadersMap(tempConnectedReaders);
        }

        const tempArray = Array.from(tempConnectedReaders.values());
        if (JSON.stringify(tempArray) !== JSON.stringify(readersArray)) {
            setReadersArray(tempArray);
        }
    }

    // helper function to switch patient assignment for devices
    const updatePatientForDevice = (deviceID, patientID) => {
        let tempMap = new Map(readerToPatientMap);
        tempMap.set(deviceID, patientID);
        console.log('updating patient id for result to ' + patientID + ' for device ' + deviceID);
        setReaderToPatientMap(tempMap);
        console.log('map of selected patients', readerToPatientMap);
    }

    // define behavior of discovered but not connected reader display card
    function DiscoveredReader(props) {
        const {id, name, statusText} = props;
        return <View style={[[device.container, device.containerDefault], isLandscape ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                    <View style={device.header}>
                        <IconA name='checkcircleo' size={34} style={device.connectedIcon}/>
                        <View>
                            <Text style={[device.nameText, device.nameTextDefault]}>{name}</Text>
                            <Text style={[device.statusText, device.statusTextDefault]}>{statusText}</Text>
                        </View>
                    </View>
                    <View style={isLandscape ? device.buttonContainerLandscape : device.buttonContainer}>
                        <TouchableOpacity style={[device.button, device.buttonDefault]} onPress={() => {connect(id, name)}}>
                            <Text style={[device.buttonText, device.buttonTextDefault]}>Connect</Text>
                        </TouchableOpacity>
                    </View>
                </View>;
    }

    const DiscoveredReaderMemo = React.memo(DiscoveredReader);

    function ConnectedReader(props) {
        const {id, name, color, utilityBar, statusText} = props;

        let containerColors = device.containerLightGreen;
        let buttonColors = device.buttonLightGreen;
        let buttonTextColors = device.buttonTextLightGreen;
        let statusTextColors = device.statusTextLightGreen;
        let nameColors = device.nameTextLightGreen;

        if(color === 'green') {
            // test running
            containerColors = device.containerGreen;
            buttonColors = device.buttonGreen;
            buttonTextColors = device.buttonTextGreen;
            statusTextColors = device.statusTextGreen;
            nameColors = device.nameTextGreen;
        } else if(color === 'light-green') {
            // test finished
            containerColors = device.containerLightGreen;
            buttonColors = device.buttonLightGreen;
            buttonTextColors = device.buttonTextLightGreen;
            statusTextColors = device.statusTextLightGreen;
            nameColors = device.nameTextLightGreen;
        } else if(color === 'orange') {
            // test error
            containerColors = device.containerOrange;
            buttonColors = device.buttonOrange;
            buttonTextColors = device.buttonTextOrange;
            statusTextColors = device.statusTextOrange;
            nameColors = device.nameTextOrange;
        }

        return <View style={[device.container, containerColors]}>
                    <View style={device.header}>
                        <IconA name='checkcircleo' size={34} style={device.connectedIcon}/>
                        <View>
                            <Text style={[device.nameText, nameColors]}>{name}</Text>
                            <Text style={[device.statusText, statusTextColors]}>
                                {statusText}
                            </Text>
                        </View>
                        {
                            (isLandscape) &&
                            <TouchableOpacity style={[device.button, buttonColors]} onPress={() => disconnectFromDevice(id)}>
                                <Text style={[device.buttonText, buttonTextColors]}>Disconnect</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    <View style={device.buttonContainer}>
                        {
                            (!isLandscape) &&
                            <TouchableOpacity style={[device.button, buttonColors]} onPress={() => disconnectFromDevice(id)}>
                                <Text style={[device.buttonText, buttonTextColors]}>Disconnect</Text>
                            </TouchableOpacity>
                        }
                        {
                            (utilityBar === 'covid') &&
                            <TouchableOpacity style={[device.button, buttonColors]}
                                              onPress={() => {
                                                  setLastTappedDeviceForPatientSelect(id);
                                                  setViewCOVIDPatientModalVisible(true);
                                              }}>
                                <Text style={[device.buttonText, buttonTextColors]}>Select patient for next result</Text>
                            </TouchableOpacity>
                        }
                        {
                            (utilityBar === 'fibrinogen') &&
                            <TouchableOpacity style={[device.button, buttonColors]}
                                              onPress={() => {
                                                  setLastTappedDeviceForPatientSelect(id);
                                                  setViewFibrinogenPatientModalVisible(true);
                                              }}>
                                <Text style={[device.buttonText, buttonTextColors]}>Select patient for next result</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>;
    }

    const ConnectedReaderMemo = React.memo(ConnectedReader);

    return <SafeAreaView style={format.safeArea}>
                <View style={format.page}>
                    <ModalSelector
                        onChange={(option) => {
                            setViewCOVIDPatientModalVisible(false);
                            updatePatientForDevice(lastTappedDeviceForPatientSelect, option[0]);
                        }}
                        renderItem={<View/>}
                        customSelector={<View/>}
                        visible={viewCOVIDPatientModalVisible}
                        data={covidPatients}
                        keyExtractor={patient => patient[0]}
                        labelExtractor={patient => patient[1]['name']}
                        onCancel={() => setViewCOVIDPatientModalVisible(false)}
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
                        onChange={(option) => {
                            setViewFibrinogenPatientModalVisible(false);
                            updatePatientForDevice(lastTappedDeviceForPatientSelect, option[0]);
                        }}
                        renderItem={<View/>}
                        customSelector={<View/>}
                        visible={viewFibrinogenPatientModalVisible}
                        data={fibrinogenPatients}
                        keyExtractor={patient => patient[0]}
                        labelExtractor={patient => patient[1]['name']}
                        onCancel={() => setViewFibrinogenPatientModalVisible(false)}
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
                    <FlatList data={readersArray}
                              keyExtractor={(item) => item.id}
                              renderItem={({item}) => {
                                  if(item.isConnected)
                                      return <ConnectedReaderMemo id={item.id} name={item.name}
                                                                  color={item.color} utilityBar={item.utilityBar}
                                                                  statusText={item.statusText} />
                                  else
                                    return <DiscoveredReaderMemo id={item.id} name={item.name}
                                                                 statusText={item.statusText} />
                              }} />
                </View>
                <UserBar navigation={navigation}/>
            </SafeAreaView>;
}

export default Monitor;