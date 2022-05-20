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
        [lastTappedDeviceForPatientSelect, setLastTappedDeviceForPatientSelect] = useState(null),
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
        patientTestDBRef = (testKey) => database().ref(patientTestsPath + testKey);

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
                                updateReaderCards({id: device.id, name: device.name, isConnected: false});
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

    const disconnectFromDevice = (deviceID) => {
        manager.cancelDeviceConnection(deviceID)
            .then((device) => {
                updateReaderCards({
                    name: device.name,
                    id: device.id,
                    statusText: 'Discovered',
                    isConnected: false
                });
            })
            .then(() => console.log("Disconnected from device"))
    }

    function jsonFromBytes(bytes) {
        const b64buf = new Buffer(bytes, 'base64');
        const str = b64buf.toString('ascii');
        return JSON.parse(str);
    }

    // subscribe to the action characteristic
    const subscribe = (device) => {
        updateReaderCards({
            name: device.name,
            id: device.id,
            statusText: 'Idle',
            isConnected: true
        });
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
                        isConnected: false
                    });
                }
            });
    }


    // BLE update handler function
    //  - update status label
    //  - if there is a user error, show instructions
    //  - if there is a finished measurement, store it in the appropriate location
    //   on the firebase database
    //  - if there is useful info, send a notification to user
    const handleUpdate = (device, action, status, data) => {
        switch (action) {
            /*
                COVID test handlers
             */

            case 'measurement.covid.startedHeating':
                console.debug('COVID test, device has started heating', JSON.stringify(data, null, 4))
                break;

            case 'status.covidSecondsRemaining':
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true,
                    lastStatus: status, lastAction: action, lastData: data,
                    statusText: data
                });
                break;

            case 'measurement.covid.testStartedSuccessfully':
                console.debug('COVID test started successfully');
                break;

            case 'dataProcess.covid.finishedTest':
                console.debug('COVID test result received', JSON.stringify(data, null, 4));
                break;

            /*
                Fibrinogen test handlers
            */

            case 'measurement.fibrinogen.testStartedSuccessfully':
                console.debug('Fibrinogen test started successfully');
                break;

            case 'status.fibrinogenSecondsRemaining':
                updateReaderCards({
                    name: device.name, id: device.id, isConnected: true,
                    lastStatus: status, lastAction: action, lastData: data,
                    statusText: data
                });
                break;

            case 'measurement.fibrinogen.testError':
                console.debug('Fibrinogen test error', JSON.stringify(data, null, 4));
                break;

            case 'dataProcess.fibrinogen.finishedTest':
                if (readerToPatientMap.get(device.id)) {
                    Alert.alert('Uploading patient fibrinogen result', JSON.stringify(data, null, 4));
                    uploadFibrinogenResultForPatient(device.id, data);
                } else {
                    Alert.alert('Uploading guest fibrinogen result', JSON.stringify(data, null, 4));
                    uploadFibrinogenResultForPatient(device.id, data);
                }
                break;

            default:
                Alert.alert('Unrecognized action received', JSON.stringify(action));
        }
    }

    // helper function to update the visible cards
    const updateReaderCards = (item) => {
        const tempConnectedReaders = new Map(readersMap);
        tempConnectedReaders.set(item.id, item);

        if (JSON.stringify(readersMap) !== tempConnectedReaders) {
            setReadersMap(tempConnectedReaders);
        }

        const tempArray = Array.from(tempConnectedReaders.values());
        if (JSON.stringify(tempArray) !== JSON.stringify(readersArray)) {
            setReadersArray(tempArray);
        }
    }

    const isLandscape = (dimensions.width > dimensions.height);
    const utilityBarStyle = isLandscape ? device.utilityBarContainerHorizontal : device.utilityBarContainerVertical;
    const headerStyle = isLandscape ? {flexDirection: 'row'} : {flexDirection: 'column'};
    const toggleViewCOVIDPatientModal = () => setViewCOVIDPatientModalVisible(!viewCOVIDPatientModalVisible);
    const toggleViewFibrinogenPatientModal = () => setViewFibrinogenPatientModalVisible(!viewFibrinogenPatientModalVisible);

    // define behavior of discovered but not connected reader display card
    function DiscoveredReader(props) {
        const {id, name} = props;
        return <View style={device.container}>
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
                </View>;
    }

    const DiscoveredReaderMemo = React.memo(DiscoveredReader);

    function ConnectedReader(props) {
        const {id, name, statusText} = props;

        const UtilityButtons = ({statusText}) => {
            if (true) {
              return (
                  <>
                      <TouchableOpacity style={device.utilityBarButton}
                                        onPress={() => {
                                            setLastTappedDeviceForPatientSelect(id);
                                            setViewCOVIDPatientModalVisible(true);
                                        }}>
                          <Text style={device.utilityButtonText}>Assign COVID patient</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={device.utilityBarButton}
                                        onPress={() => {
                                            setLastTappedDeviceForPatientSelect(id);
                                            setViewFibrinogenPatientModalVisible(true);
                                        }}>
                          <Text style={device.utilityButtonText}>Assign fibrinogen patient</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={device.utilityBarButton}
                                        onPress={() => {
                                            disconnectFromDevice(id);
                                        }}>
                          <Text style={device.utilityButtonText}>Disconnect from device</Text>
                      </TouchableOpacity>
                  </>
              );
            } else if (statusText.includes('COVID')) {
                return (
                    <TouchableOpacity style={device.utilityBarButton}
                                      onPress={() => {
                                          setLastTappedDeviceForPatientSelect(id);
                                          setViewCOVIDPatientModalVisible(true);
                                      }}>
                        <Text style={device.utilityButtonText}>Assign COVID patient</Text>
                    </TouchableOpacity>);
            } else if (statusText.includes('Fibrinogen')) {
                return (
                    <TouchableOpacity style={device.utilityBarButton}
                                      onPress={() => {
                                          setLastTappedDeviceForPatientSelect(id);
                                          setViewFibrinogenPatientModalVisible(true);
                                      }}>
                        <Text style={device.utilityButtonText}>Assign fibrinogen patient</Text>
                    </TouchableOpacity>);
            } else return <View/>;
        }

        return (
            <View style={device.container}>
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
                            <UtilityButtons statusText={statusText}/>
                        </View>
                    </View>
            </View>
        );
    }

    const uploadCOVIDResultForPatient = (patientID, result) => {
        const dbRef = database().ref(patientsPath + '/covid/' + patientID + '/results/');
        //dbRef.push({result: result, time: new Date().getDate()});
        console.log('db ref for fibrinogen result:', dbRef);
    }

    const uploadFibrinogenResultForPatient = (deviceID, result) => {
        const patientID = readerToPatientMap.get(deviceID);
        const dbRef = database().ref(patientsPath + '/fibrinogen/' + patientID + '/results/');
        //dbRef.push({result: result, time: new Date().getDate()});
        console.log('db ref for fibrinogen result:', dbRef, 'and result:\n', );
    }


    const ConnectedReaderMemo = React.memo(ConnectedReader);

    const updatePatientForDevice = (deviceID, patientID) => {
        let tempMap = new Map(readerToPatientMap);
        tempMap.set(deviceID, patientID);
        console.log('updating patient id for result to ' + patientID + ' for device ' + deviceID);
        setReaderToPatientMap(tempMap);
    }

    return <SafeAreaView style={format.safeArea}>
                <View style={format.page}>
                    <ModalSelector
                        onChange={(option) => {
                            updatePatientForDevice(lastTappedDeviceForPatientSelect, option[0])
                        }}
                        renderItem={<View/>}
                        customSelector={<View/>}
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
                        onChange={(option) => {
                            updatePatientForDevice(lastTappedDeviceForPatientSelect, option[0])
                        }}
                        renderItem={<View/>}
                        customSelector={<View/>}
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
                    <FlatList data={readersArray}
                              keyExtractor={(item) => item.id}
                              renderItem={({item}) => {
                                  if(item.isConnected)
                                      return <ConnectedReaderMemo id={item.id} name={item.name}
                                                                  statusText={item.statusText} />
                                  else
                                    return <DiscoveredReaderMemo id={item.id} name={item.name} />
                              }} />
                </View>
                <UserBar navigation={navigation}/>
            </SafeAreaView>;
}

export default Monitor;