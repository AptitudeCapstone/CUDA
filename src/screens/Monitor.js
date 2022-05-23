import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, useWindowDimensions, SafeAreaView, Text, TouchableOpacity, View, FlatList, Alert} from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/Feather';
import IconE from 'react-native-vector-icons/Entypo';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalSelector from 'react-native-modal-selector';
import {BleManager} from 'react-native-ble-plx';
import {useIsFocused} from "@react-navigation/native";
import database from "@react-native-firebase/database";
import UserBar from '../components/UserBar';
import {useAuth} from '../contexts/UserContext';
import {format, modal, device, deviceColors, rbSheetStyle, rbCameraSheetStyle} from '../style';
import {serviceUUID, statusCharUUID, dataCharUUID, actionCharUUID} from '../BLEConstants'
import QRCodeScanner from "react-native-qrcode-scanner";
import {RNCamera} from "react-native-camera";
import RBSheet from "react-native-raw-bottom-sheet";
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
        [patients, setPatients] = useState(() => new Map()),
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
        isLandscape = (dimensions.width > dimensions.height),
        modalRef = useRef(null);;

    // this useEffect is the base of the patient database routine
    useEffect( () => {
        if (auth) {
            patientsRef.on('value', (patientsSnapshot) => {
                if (patientsSnapshot.exists()) {
                    const p = patientsSnapshot.toJSON();
                    setPatients(p);
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
                                                               statusText: 'Discovered', isConnected: false,
                                                               selectedPatient: 'Not selected'});
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
                                                            statusText: 'Discovered', isConnected: false,
                                                            selectedPatient: 'Not selected'}));

    const getJSON = (bytes) => JSON.parse(new Buffer(bytes, 'base64').toString('ascii'));

    const subscribe = (device) => {
        updateReaderCards({name: device.name, id: device.id, color: 'default',
            statusText: 'Device is idle', isConnected: true, selectedPatient: 'Not selected'});
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
        const selectedPatient = readerToPatientMap.get(device.id);
        let covidDBRef, fibrinogenDBRef;

        let name = selectedPatient?.name
        if(!name) name = 'Not selected'

        if(selectedPatient) {
            covidDBRef = database().ref(patientsPath + 'covid-patients/' + selectedPatient.id + '/results/');
            fibrinogenDBRef = database().ref(patientsPath + '/fibrinogen-patients/' + selectedPatient.id + '/results/');
        } else {
            covidDBRef = database().ref(patientsPath + 'guest-results/covid/results/');
            fibrinogenDBRef = database().ref(patientsPath + '/guest-results/fibrinogen/results/');
        }

        switch (action) {
            case 'measurement.covid.beginningTest':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Starting new test',
                                       selectedPatient: name});
                break;
            case 'measurement.covid.startedHeating':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Device is warming up',
                                       selectedPatient: name});
                break;
            case 'measurement.covid.testStartedSuccessfully':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Running test',
                                       selectedPatient: name});
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
                                       utilityBar: 'covid',  statusText: covidMin + covidSec + ' remaining',
                                       selectedPatient: name});
                break;
            case 'dataProcess.covid.finishedTest':
                const covidResult = {result: data, time: new Date()};
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'covid',  statusText: 'Result: ' + data,
                                       selectedPatient: name});
                Alert.alert('Uploading COVID result', JSON.stringify(covidResult, null, 4));
                break;
            case 'measurement.covid.testError':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'orange',
                                       utilityBar: 'covid',  statusText: 'An error occurred while testing',
                                       selectedPatient: name});
                break;
            case 'measurement.fibrinogen.beginningTest':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'fibrinogen',  statusText: 'Starting new test',
                                       selectedPatient: name});
                break;
            case 'measurement.fibrinogen.testStartedSuccessfully':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'green',
                                       utilityBar: 'fibrinogen',  statusText: 'Running test',
                                       selectedPatient: name});
                break;
            case 'dataProcess.fibrinogen.finishedTest':
                const result = parseFloat(data).toFixed(2);
                updateReaderCards({name: device.name, id: device.id,
                    isConnected: true, color: 'green', selectedPatient: name,
                    utilityBar: 'fibrinogen', statusText: 'Result: ' + result});
                const fibrinogenResult = {result: result, time: new Date().toISOString()};
                const newTestRef = fibrinogenDBRef.push();
                newTestRef.set(fibrinogenResult)
                    .then(() => Alert.alert('Uploaded result', 'Result: ' + result))
                    .catch((error) => Alert.alert('Error uploading result', 'Error: ' + error))
                break;
            case 'measurement.fibrinogen.testError':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'orange',
                                       utilityBar: 'fibrinogen',  statusText: 'An error occurred while testing',
                                       selectedPatient: name});
                break;
            case 'measurement.chipRemoved':
                updateReaderCards({name: device.name, id: device.id, isConnected: true, color: 'default',
                                       statusText: 'Device is idle', selectedPatient: name});
                break;
        }
    }

    // helper function to update the visible cards
    const updateReaderCards = (item) => {
        setReadersMap(readersMap.set(item.id, item));
        setReadersArray(Array.from(readersMap.values()));
    }

    // helper function to switch patient assignment for devices
    const updatePatientForDevice = (deviceID, patientID, patientName) => {
        setReaderToPatientMap(readerToPatientMap.set(deviceID, {id: patientID, name: patientName}));
        let tempReader = readersMap.get(deviceID);
        tempReader.selectedPatient = patientName;
        setReadersMap(readersMap.set(deviceID, tempReader));
        setReadersArray(Array.from(readersMap.values()));
    };

    function DiscoveredReader(props) {
        const {id, name, statusText} = props;
        const {headerColors} = deviceColors['default'];

        return <View style={[[device.container], isLandscape ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                    <View style={[device.header, headerColors, isLandscape ? {borderBottomLeftRadius: 15} : {borderBottomLeftRadius: 0}]}>
                        <View style={{flex: 1}}>
                            <Text style={[device.nameText]}>{name}</Text>
                            <Text style={[device.statusText]}>{statusText}</Text>
                        </View>
                    </View>
                        <View style={[device.body, isLandscape ? device.buttonContainerLandscape : device.buttonContainer,
                            isLandscape ? {borderBottomLeftRadius: 0} : {borderBottomLeftRadius: 15}]}>
                            <TouchableOpacity style={[device.button]} onPress={async () => {await connect(id)}}>
                                <Text style={[device.buttonText]}>Connect</Text>
                                <IconMCI name='bluetooth-connect' size={24} style={format.utilityBarButtonIcon}/>
                            </TouchableOpacity>
                        </View>
                </View>;
    }
    const DiscoveredReaderMemo = React.memo(DiscoveredReader);

    function ConnectedReader(props) {
        const {id, name, color, utilityBar, statusText, selectedPatient} = props;
        const {headerColors} = deviceColors[color];

        return <View style={device.container}>
                    <View style={[device.header, headerColors]}>
                        <View style={{flex: 1, textAlign: 'center'}}>
                            <Text style={[device.nameText]}>{name}</Text>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: 30}}>
                                {
                                    (selectedPatient !== 'Not selected')
                                        ? <IconF name='user-check' color='#ddd' size={24} />
                                        : <IconF name='user' color='#ddd' size={24} />
                                }
                                </View>
                                <Text style={[device.patientText]}>{selectedPatient}</Text>
                            </View>
                                {
                                    (color === 'default' || color === 'green' && statusText.includes('Result')) &&
                                    <View style={{flexDirection: 'row'}}>
                                        <IconF style={{width: 30}} name='check-square' color='#ddd' size={24} />
                                        <Text style={[device.statusText]}>{statusText}</Text>
                                    </View>
                                }
                                {
                                    (color === 'green' && !statusText.includes('Result')) &&
                                    <View style={{flexDirection: 'row'}}>
                                        <ActivityIndicator style={{width: 30}} color='#ddd' size={24} />
                                        <Text style={[device.statusText]}>{statusText}</Text>
                                    </View>
                                }
                        </View>
                        {
                            (isLandscape && color === 'default') &&
                            <TouchableOpacity style={[device.button]}
                                              onPress={async () => await disconnectFromDevice(id)}>
                                <Text style={[device.buttonText]}>Disconnect</Text>
                            </TouchableOpacity>
                        }
                        <IconA name='checkcircleo' size={34} style={device.connectedIcon}/>
                    </View>
                    <View style={device.body}>
                        <View style={device.patientSelect}>
                            <View style={{flexGrow: 1, textAlign: 'center'}}>
                                <TouchableOpacity style={[device.button]} onPress={() => {
                                    setLastTappedDeviceForPatientSelect(id);
                                    modalRef.current?.open()
                                }}>
                                    <Text style={[device.buttonText]}>Scan patient QR</Text>
                                    <IconMCI name='qrcode-scan' size={24} style={format.utilityBarButtonIcon}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={device.buttonContainer}>
                            {
                                (!isLandscape && color === 'default') &&
                                <TouchableOpacity style={[device.button]}
                                                  onPress={async () => await disconnectFromDevice(id)}>
                                    <Text style={[device.buttonText]}>Disconnect</Text>
                                    <IconA name='disconnect' size={24} style={format.utilityBarButtonIcon}/>
                                </TouchableOpacity>
                            }
                            {
                                (utilityBar === 'covid') &&
                                <TouchableOpacity style={[device.button]}
                                                  onPress={() => {
                                                      setLastTappedDeviceForPatientSelect(id);
                                                      setViewCOVIDPatientModalVisible(true);
                                                  }}>
                                    <Text style={[device.buttonText]}>Select patient from list</Text>
                                    <IconE name='list' size={24} style={format.utilityBarButtonIcon}/>
                                </TouchableOpacity>
                            }
                            {
                                (utilityBar === 'fibrinogen') &&
                                <TouchableOpacity style={[device.button]}
                                                  onPress={() => {
                                                      setLastTappedDeviceForPatientSelect(id);
                                                      setViewFibrinogenPatientModalVisible(true);
                                                  }}>
                                    <Text style={[device.buttonText]}>Select patient from list</Text>
                                    <IconE name='list' size={24} style={format.utilityBarButtonIcon}/>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>;
    }
    const ConnectedReaderMemo = React.memo(ConnectedReader);

    return <SafeAreaView style={format.safeArea}>
                <View style={format.page}>
                    <ModalSelector
                        onChange={(option) => {
                            setViewCOVIDPatientModalVisible(false);
                            updatePatientForDevice(lastTappedDeviceForPatientSelect, option[0], option[1]['name']);
                        }}
                        renderItem={<View/>}
                        customSelector={<View/>}
                        visible={viewCOVIDPatientModalVisible}
                        data={covidPatients}
                        keyExtractor={patient => patient[0]}
                        labelExtractor={patient => patient[1]['name']}
                        onCancel={() => setViewCOVIDPatientModalVisible(false)}
                        cancelText={'Cancel'}
                        overlayStyle={modal.overlay}
                        optionContainerStyle={modal.container}
                        optionTextStyle={modal.optionText}
                        optionStyle={modal.option}
                        cancelStyle={modal.cancelOption}
                        cancelTextStyle={modal.cancelText}
                    />
                    <ModalSelector
                        onChange={(option) => {
                            setViewFibrinogenPatientModalVisible(false);
                            updatePatientForDevice(lastTappedDeviceForPatientSelect, option[0], option[1]['name']);
                        }}
                        renderItem={<View/>}
                        customSelector={<View/>}
                        visible={viewFibrinogenPatientModalVisible}
                        data={fibrinogenPatients}
                        keyExtractor={patient => patient[0]}
                        labelExtractor={patient => patient[1]['name']}
                        onCancel={() => setViewFibrinogenPatientModalVisible(false)}
                        cancelText={'Cancel'}
                        overlayStyle={modal.overlay}
                        optionContainerStyle={modal.container}
                        optionTextStyle={modal.optionText}
                        optionStyle={modal.option}
                        cancelStyle={modal.cancelOption}
                        cancelTextStyle={modal.cancelText}
                    />
                    <FlatList
                        data={readersArray}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => {
                            if(item.isConnected) return <ConnectedReaderMemo id={item.id} name={item.name}
                                                                             color={item.color}
                                                                             utilityBar={item.utilityBar}
                                                                             statusText={item.statusText}
                                                                             selectedPatient={item.selectedPatient}/>
                            else return <DiscoveredReaderMemo id={item.id} name={item.name}
                                                              statusText={item.statusText}/>
                        }} />
                </View>
                <UserBar navigation={navigation}/>
                <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbCameraSheetStyle}>
                    <QRCodeScanner
                        onRead={(e) => {
                            Alert.alert('Setting patient to ', e.data);
                            console.log('reader to patient map before:', readerToPatientMap);
                            const temp = readerToPatientMap.set(lastTappedDeviceForPatientSelect, e.data);
                            setReaderToPatientMap(temp);
                            console.log('after:', temp);
                            const deviceInfo = readersMap.get(lastTappedDeviceForPatientSelect);
                            console.log('device info before:', deviceInfo);
                            deviceInfo.selectedPatient = e.data;
                            updateReaderCards(deviceInfo);
                            console.log('after:', readersMap.get(lastTappedDeviceForPatientSelect))
                            modalRef.current?.close();
                        }}
                        flashMode={RNCamera.Constants.FlashMode.auto}
                        topContent={
                            <Text style={[device.statusText, {color: '#888', textAlign: 'center'}]}>
                                Place QR code into the frame
                            </Text>
                        }
                    />
                </RBSheet>
            </SafeAreaView>;
}

export default Monitor;