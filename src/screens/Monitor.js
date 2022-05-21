import React, {useEffect, useRef, useState} from 'react';
import {useWindowDimensions, SafeAreaView, Text, TouchableOpacity, View, FlatList, Alert} from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import ModalSelector from 'react-native-modal-selector-searchable';
import {BleManager} from 'react-native-ble-plx';
import {useIsFocused} from "@react-navigation/native";
import database from "@react-native-firebase/database";
import UserBar from '../components/UserBar';
import {useAuth} from '../contexts/UserContext';
import {format, modal, device, deviceColors} from '../style';
import {serviceUUID, statusCharUUID, dataCharUUID, actionCharUUID} from '../BLEConstants'
const Buffer = require("buffer").Buffer;
export const manager = new BleManager();

const Monitor = ({navigation}) => {
    const [readersMap, setReadersMap] = useState(() => new Map()),
        [readersArray, setReadersArray] = useState(() => []),
        [readerToPatientMap, setReaderToPatientMap] = useState(() => new Map()),
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
        patientsPath = (organization ? '/organizations/' + organization + '/patients/' : '/users/' + auth?.uid),
        patientsRef = database().ref(patientsPath),
        isLandscape = (dimensions.width > dimensions.height);

    // this useEffect is the base of the patient database routine
    useEffect( () => {
        if (auth) {
            patientsRef.on('value', (patientsSnapshot) => {
                if (patientsSnapshot.exists()) {
                    const p = patientsSnapshot.toJSON();
                    if(p && p['covid-patients']) {
                        const c = Object.keys(p['covid-patients']).map((k) => [k, p['covid-patients'][k]]);
                        setCovidPatients(c);
                    } else setCovidPatients([]);
                    if(p['fibrinogen-patients']) {
                        const f = Object.keys(p['fibrinogen-patients']).map((k) => [k, p['fibrinogen-patients'][k]]);
                        setFibrinogenPatients(f);
                    } else setFibrinogenPatients([]);
                } else {
                        setCovidPatients([]);
                        setFibrinogenPatients([]);
                }
            }, (error) => console.error('Error fetching database updates:', error));
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
                    manager.startDeviceScan(null, null, 
                        async (bleError, device) => {
                            if (bleError || !device || !device?.name) {
                                if (bleError) console.log('BLE Error: ' + bleError);
                            } else if (device.name.includes('AMS-')) {
                                try {
                                    if (!readersMap.get(device.id) && autoConnectByName.current)
                                        await connect(device.id);
                                    else if (!readersMap.get(device.id))
                                        updateReaderCards({id: device.id, name: device.name, color: 'default',
                                                               statusText: 'Discovered', isConnected: false});
                                } catch (err) {
                                    console.log('Device connection error: ' + err)
                                }
                            }
                        });
                    subscription.remove();
            }
        }, true);
        return () => subscription.remove();
    }, [manager]);

    const connect = (deviceID) =>
        manager.connectToDevice(deviceID)
            .then((device) => device.discoverAllServicesAndCharacteristics())
            .then((device) =>  subscribe(device));

    const disconnectFromDevice = (id) =>
        manager.cancelDeviceConnection(id)
            .then((device) => updateReaderCards({name: device.name, id: id, color: 'default',
                                                            statusText: 'Discovered', isConnected: false}));

    // get json data from base64 data
    const getJSON = (bytes) => JSON.parse(new Buffer(bytes, 'base64').toString('ascii'));

    const subscribe = (device) => {
        updateReaderCards({name: device.name, id: device.id, color: 'default',
            statusText: 'Idle', isConnected: true});
        device.monitorCharacteristicForService(serviceUUID, actionCharUUID, async (bleError) => {
            const isConnected = await manager.isDeviceConnected(device.id);
            if(!isConnected) return 'BLE device disconnected';
            if(!bleError) {
                const action = await device.readCharacteristicForService(serviceUUID, actionCharUUID);
                const status = await device.readCharacteristicForService(serviceUUID, statusCharUUID);
                const data = await device.readCharacteristicForService(serviceUUID, dataCharUUID);
                handleUpdate(device, getJSON(action.value), getJSON(status.value), getJSON(data.value));
            }
        });
    }

    const handleUpdate = (device, action, status, data) => {
        let selectedPatient = readerToPatientMap.get(device.id);
        let covidDBRef, fibrinogenDBRef;

        if(selectedPatient) {
            covidDBRef = database().ref(patientsPath + '/covid-patients/' + selectedPatient + '/results/');
            fibrinogenDBRef = database().ref(patientsPath + '/fibrinogen-patients/' + selectedPatient + '/results/');
        } else {
            covidDBRef = database().ref(patientsPath + '/guest-results/covid/results/');
            fibrinogenDBRef = database().ref(patientsPath + '/guest-results/fibrinogen/results/');
        }

        switch (action) {
            case 'measurement.covid.beginningTest':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Beginning a COVID test'});
                break;
            case 'measurement.covid.startedHeating':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Device is warming up'
                });
                break;
            case 'measurement.covid.testStartedSuccessfully':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'COVID measurement in progress'
                });
                break;
            case 'status.covidSecondsRemaining':
                const covidTimeRemaining = new Date(data * 1000).toISOString().substr(14, 5);
                const covidMin = (covidTimeRemaining[0] === '0' && covidTimeRemaining[1] !== '0')
                    ? covidTimeRemaining[1] + ' min. '
                    :  covidTimeRemaining[0] + covidTimeRemaining[1] + 'min. ';
                const covidSec = (covidTimeRemaining[3] === '0' && covidTimeRemaining[4] !== '0')
                    ? covidTimeRemaining[4] + 'sec.'
                    : covidTimeRemaining[3] + covidTimeRemaining[4] + ' sec.';
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: covidMin + covidSec + ' remaining'
                });
                break;
            case 'dataProcess.covid.finishedTest':
                const covidResult = {result: data, time: new Date().getDate()};
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Test complete with result ' + data});
                Alert.alert('Uploading COVID result', JSON.stringify(covidResult, null, 4));
                break;
            case 'measurement.covid.testError':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'orange',
                                       utilityBar: 'covid',  statusText: 'An error occurred while testing'});
                break;
            case 'measurement.fibrinogen.beginningTest':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'fibrinogen',  statusText: 'Beginning a fibrinogen test'});
                break;
            case 'measurement.fibrinogen.testStartedSuccessfully':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'fibrinogen',  statusText: 'Fibrinogen measurement in progress'});
                break;
            case 'dataProcess.fibrinogen.finishedTest':
                const result = parseFloat(data).toFixed(2);
                updateReaderCards({name: device.name, id: device.id,
                    isConnected: true, color: 'green',
                    utilityBar: 'fibrinogen', statusText: 'Test complete with result ' + result});
                const fibrinogenResult = {result: result, time: new Date().toLocaleString()};
                const newTestRef = fibrinogenDBRef.push();
                newTestRef.set(fibrinogenResult)
                    .then(() => Alert.alert('Uploaded result', 'Result: ' + result))
                    .catch((error) => Alert.alert('Error uploading result', 'Error: ' + error))
                break;
            case 'measurement.fibrinogen.testError':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'orange',
                                       utilityBar: 'fibrinogen',  statusText: 'An error occurred while testing'});
                break;
            case 'measurement.chipRemoved':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'default',
                                       statusText: 'Idle'});
                break;

            default:
                Alert.alert('Unrecognized action received', JSON.stringify(action));
        }
    }

    // helper function to update the visible cards
    const updateReaderCards = (item) => {
        setReadersMap(readersMap.set(item.id, item));
        setReadersArray(Array.from(readersMap.values()));
    }

    // helper function to switch patient assignment for devices
    const updatePatientForDevice = (deviceID, patientID) => setReaderToPatientMap(readerToPatientMap.set(deviceID, patientID));

    function DiscoveredReader(props) {
        const {id, name, statusText} = props;
        const {containerColors, buttonColors, buttonTextColors, statusTextColors, nameColors} = deviceColors['default'];

        return <View style={[[device.container, containerColors], isLandscape ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                    <View style={device.header}>
                        <IconA name='checkcircleo' size={34} style={device.connectedIcon}/>
                        <View>
                            <Text style={[device.nameText, nameColors]}>{name}</Text>
                            <Text style={[device.statusText, statusTextColors]}>{statusText}</Text>
                        </View>
                    </View>
                    <View style={isLandscape ? device.buttonContainerLandscape : device.buttonContainer}>
                        <TouchableOpacity style={[device.button, buttonColors]} onPress={async () => {
                            await connect(id)
                        }}>
                            <Text style={[device.buttonText, buttonTextColors]}>Connect</Text>
                        </TouchableOpacity>
                    </View>
                </View>;
    }
    const DiscoveredReaderMemo = React.memo(DiscoveredReader);

    function ConnectedReader(props) {
        const {id, name, color, utilityBar, statusText} = props;
        const {containerColors, buttonColors, buttonTextColors, statusTextColors, nameColors} = deviceColors[color];

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
                            (isLandscape && color === 'default') &&
                            <TouchableOpacity style={[device.button, buttonColors]}
                                              onPress={async () => await disconnectFromDevice(id)}>
                                <Text style={[device.buttonText, buttonTextColors]}>Disconnect</Text>
                            </TouchableOpacity>
                        }
                    </View>
                    <View style={device.buttonContainer}>
                        {
                            (!isLandscape && color === 'default') &&
                            <TouchableOpacity style={[device.button, buttonColors]}
                                              onPress={async () => await disconnectFromDevice(id)}>
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
                                <Text style={[device.buttonText, buttonTextColors]}>Select patient for result</Text>
                            </TouchableOpacity>
                        }
                        {
                            (utilityBar === 'fibrinogen') &&
                            <TouchableOpacity style={[device.button, buttonColors]}
                                              onPress={() => {
                                                  setLastTappedDeviceForPatientSelect(id);
                                                  setViewFibrinogenPatientModalVisible(true);
                                              }}>
                                <Text style={[device.buttonText, buttonTextColors]}>Select patient for result</Text>
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
                    <FlatList
                        data={readersArray}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => {
                            if(item.isConnected) return <ConnectedReaderMemo id={item.id} name={item.name}
                                                                             color={item.color}
                                                                             utilityBar={item.utilityBar}
                                                                             statusText={item.statusText}/>
                            else return <DiscoveredReaderMemo id={item.id} name={item.name}
                                                              statusText={item.statusText}/>
                        }} />
                </View>
                <UserBar navigation={navigation}/>
            </SafeAreaView>;
}

export default Monitor;