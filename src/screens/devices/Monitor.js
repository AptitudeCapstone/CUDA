import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    FlatList,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import IconE from 'react-native-vector-icons/Entypo';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalSelector from 'react-native-modal-selector-searchable';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {useIsFocused} from '@react-navigation/native';
import BleManager from 'react-native-ble-manager';
import {Buffer} from 'buffer';


export const Monitor = ({navigation, route}) => {
    const isFocused = useIsFocused(),
        [selectedTest, setSelectedTest] = useState('Fibrinogen'),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        [isScanning, setIsScanning] = useState(false),
        [selectedPeripheralID, setSelectedPeripheralID] = useState([]),
        [autoConnectSwitch, setAutoConnectSwitch] = useState(autoConnectByName),

        /*

                BLE

                Single service with 6 characteristics
                1. Pico status
                2. Program task
                3. Sensor type
                4. Last result
                5. Last result timestamp

         */


        scanInterval = 3.0, // BLE scan interval in seconds
        BleManagerModule = NativeModules.BleManager,
        bleEmitter = new NativeEventEmitter(BleManagerModule),
        serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13',
        characteristics = {
            picoStatus : '04CB0EB1-8B58-44D0-91E4-080AF33438BA',
            programTask : '04CB0EB1-8B58-44D0-91E4-080AF33438BB',
            chipType : '04CB0EB1-8B58-44D0-91E4-080AF33438BD',
            lastResult : '04CB0EB1-8B58-44D0-91E4-080AF33438BE',
            lastResultTime : '04CB0EB1-8B58-44D0-91E4-080AF33438BF'
        },
        charNameMap = Object.fromEntries(Object.entries(characteristics).map(a => a.reverse())),
        discoveredPeripherals = new Map(),
        connectedPeripherals = new Map(),
        [discoveredList, setDiscoveredList] = useState([]),
        [connectedList, setConnectedList] = useState([]),
        autoConnectByName = useRef(false);

    /*

            BLUETOOTH HANDLER AND HELPER FUNCTIONS

     */

    // BLE mount and unmount event handler
    useEffect(() => {
        console.debug('BLE: Initializing');

        // Initialize BLE module
        BleManager.start({showAlert: false}).then(() => {
            // Add ble listeners on mount
            bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleEmitter.addListener('BleManagerStopScan', handleStopScan);
            bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleEmitter.addListener('BleManagerConnectPeripheral', handleConnectedPeripheral);
            bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

            // Check location permissions for android devices
            if (Platform.OS === 'android' && Platform.Version >= 23) {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
                    if (r1) return;

                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
                        if (r2) return;
                    });
                });
            }
        });

        // Remove all BLE listeners on unmount
        return () => {
            bleEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
            bleEmitter.removeAllListeners('BleManagerStopScan');
            bleEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
            bleEmitter.removeAllListeners('BleManagerConnectPeripheral');
            bleEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
            console.debug('BLE: Releasing all processes');
        };
    }, []);

    // Device discovery handler
    const handleDiscoverPeripheral = (peripheral) => {
        if (!connectedPeripherals.has(peripheral['id']) && isAptitudeDevice(peripheral)) {

            // Update map of all discovered peripherals
            discoveredPeripherals.set(peripheral['id'], peripheral);
            //console.debug('BLE: Aptitude device discovered with name ' + peripheral['advertising']['localName']);

            // If auto connect is on, connect to the device and update list of connected devices
            if (autoConnectByName.current) {
                BleManager.isPeripheralConnected(peripheral['id'], [])
                    .then((isConnected) => {
                        if(!isConnected) {
                            connectPeripheral(peripheral);
                        }
                    });
            }
        } else if (connectedPeripherals.has(peripheral['id'])) {
            // update device info, like rssi
            updatePeripheralInfo(peripheral['id'], peripheral);
            //connectedPeripherals.get(peripheral['id'])['peripheral'] = peripheral;
        }
    }

    const updatePeripheralInfo = (peripheralID, peripheral) => {
        connectedPeripherals.get(peripheralID)['peripheral'] = peripheral;
        setConnectedList(Array.from(connectedPeripherals.values()));
        //console.debug(connectedPeripherals.get(peripheralID)['peripheral']['rssi']);
    }

    const updateDeviceLists = () => {
        // Update lists for UI re-render
        setDiscoveredList(Array.from(discoveredPeripherals.values()));
        setConnectedList(Array.from(connectedPeripherals.values()));
    }

    const connectPeripheral = (peripheral) => {
        if (peripheral) {
            BleManager.isPeripheralConnected(peripheral['id'], [])
                .then((isConnected) => {
                    if(!isConnected) {
                        BleManager.connect(peripheral['id']).catch(err => {
                            console.debug('BLE: Error connecting to peripheral - ' + err)
                        });
                    }
                });
        }
    }

    const handleConnectedPeripheral = (event) => {
        BleManager.retrieveServices(event['peripheral']).then((peripheral) => {
            // Add device to map of connected peripherals
            connectedPeripherals.set(peripheral['id'], {
                peripheral: peripheral,
                // maps characteristic uuid to value
                characteristic_values: new Map()
            });

                for(const [charName, charUUID] of Object.entries(characteristics)) {
                    BleManager.read(peripheral['id'], serviceUUID, charUUID)
                        .then(readData => {
                            readData = decodeCharBuffer(readData);
                            updateCharacteristicValue(peripheral['id'], charUUID, readData);
                            //console.debug('BLE: Read ' + charName + ': ' + readData);
                        }).catch(error => {
                            console.debug('BLE: Error reading ', error);
                        });

                    BleManager.startNotification(peripheral['id'], serviceUUID, charUUID).catch(error => {
                            console.debug('BLE: Error subscribing', error);
                        });
                }

            // Remove device from map of discovered peripherals
            discoveredPeripherals.delete(peripheral['id']);

            updateDeviceLists();

            //console.debug('BLE: Connected to ' + peripheral['advertising']['localName']);
        });
    };

    const handleDisconnectedPeripheral = (event) => {
        const peripheral = connectedPeripherals.get(event['peripheral']);

        if (peripheral) {
            // add to list of discovered devices
            discoveredPeripherals.set(peripheral['id'], peripheral);
            // remove from list of connected devices
            connectedPeripherals.delete(peripheral['id']);
        }

        //console.debug('BLE: Closed connection from ', peripheral);
    }

    const handleStopScan = () => {
        setIsScanning(false);
        updateDeviceLists();
    };

    const toggleAutoConnect = () => {
        const newState = !autoConnectByName.current;
        setAutoConnectSwitch(newState);
        autoConnectByName.current = newState;
        //console.debug('BLE: Auto-connect has been toggled to ' + newState);
    }

    // Scan for BLE devices
    const scanDevices = () => {
        if (!isScanning) {
            BleManager.scan([], scanInterval, false)
                .then(() => {
                    setIsScanning(true);
                }).catch((err) => {
                    console.error(err);
                });
        }
    }

    // Periodically scan for new devices
    useEffect(() => {
        const interval = setInterval(() => {
            scanDevices();
        }, scanInterval * 1000);
        return () => clearInterval(interval);
    }, []);

    const isAptitudeDevice = (peripheral) => {
        return (peripheral &&
            peripheral['advertising'] &&
            peripheral['advertising']['localName'] &&
            peripheral['advertising']['localName'].includes('AMS-') === true)
    }

    const decodeCharBuffer = (charBuffer) => Buffer.from(charBuffer).toString('ascii');

    // Characteristic update handler
    const handleUpdateValueForCharacteristic = (update) => {
        if (update && update['value']) {
            /*
            console.debug('BLE: characteristic update received' + '\n' +
                '        with value of ' + update['value'] + '\n' +
                '        from device ' + update['peripheral'] + '\n' +
                '        on characteristic ' + update['characteristic']);
             */

            const readData = decodeCharBuffer(update['value']);

            updateCharacteristicValue(update['peripheral'], update['characteristic'], readData);
            //connectedPeripherals.get(update['peripheral'])['characteristic_values'].set(update['characteristic'], readData);

            setConnectedList(Array.from(connectedPeripherals.values()));

            switch(update['characteristic']) {
                case characteristics['chipType']:
                    const data = update['value'][0].toString();
                    if (data === "-1") {
                        Alert.alert("Chip removal detected", "If a test was in progress, please wait before inserting the chip again");
                    } else if (data === "7") {
                        Alert.alert("Chip insertion detected", "Please wait while COVID testing begins");
                    } else {
                        Alert.alert("Chip insertion detected", "Please insert the sample into the collector and wait");
                    }
                    break;
                default:
                    break;
            }

        } else {
            console.debug("BLE: Unrecognized bluetooth packet received");
        }
    };

    const updateCharacteristicValue = (peripheralID, charUUID, value) => {
        const charName = charNameMap[charUUID];
        connectedPeripherals.get(peripheralID)['characteristic_values'].set(charName, value);
        setConnectedList(Array.from(connectedPeripherals.values()));
        //console.debug(connectedPeripherals.get(peripheralID)['characteristic_values']);
    }


    /*

        DEVICE LIST DISPLAY

    */

    const unconnectedDevice = (item) => {
        let iconName = '';
        if (item['rssi']) {
            if (item['rssi'] >= -50) {
                iconName = 'signal-cellular-3';
            } else if (item['rssi'] >= -75) {
                iconName = 'signal-cellular-2';
            } else if (item['rssi'] >= -85) {
                iconName = 'signal-cellular-1';
            }
        }

        return (
            <TouchableOpacity
                style={{
                    backgroundColor: '#333',
                    margin: 0,
                    alignItems: 'center',
                    padding: 60,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: '#555'
                }}
                onPress={() => {
                    setSelectedPeripheralID(item['id']);
                }}
            >
                <View style={{borderRadius: 5000, paddingBottom: 4}}>
                    {iconName !== '' &&
                    <IconMCI name={iconName} size={30}
                             color="#fff"/>
                    }
                </View>
                <Text style={{
                    fontSize: 18,
                    padding: 10,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>{item['advertising']['localName']}</Text>
                <Text style={{
                    fontSize: 14,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>Ready to connect</Text>
            </TouchableOpacity>
        );
    }

    const connectedDevice = (item) => {
        let iconName = '';
        const rssi = item['peripheral']['rssi']
        if (rssi) {
            if (rssi >= -50) {
                iconName = 'signal-cellular-3';
            } else if (rssi >= -75) {
                iconName = 'signal-cellular-2';
            } else if (rssi >= -85) {
                iconName = 'signal-cellular-1';
            }
        }

        const characteristic_values = item['characteristic_values'],
            picoStatus = characteristic_values.get('picoStatus', 'Fetching...'),
            programTask = characteristic_values.get('programTask', 'Fetching...'),
            chipType = characteristic_values.get('chipType', 'Fetching...'),
            lastResult = characteristic_values.get('lastResult', 'Fetching...'),
            lastResultTime = characteristic_values.get('lastResultTime', 'Fetching...');

        return (
            <TouchableOpacity
                style={{
                    backgroundColor: '#333',
                    margin: 0,
                    alignItems: 'center',
                    padding: 60,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: '#555'
                }}
                onPress={() => {
                    setSelectedPeripheralID(item['peripheral']['id']);
                }}
            >
                <View style={{paddingBottom: 4}}>
                    {iconName !== '' &&
                    <IconMCI name={iconName} size={30}
                             color="#fff"/>
                    }
                </View>
                <Text style={{
                    fontSize: 24,
                    padding: 10,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    {item['peripheral']['advertising']['localName']}
                </Text>
                <Text style={{
                    fontSize: 18,
                    padding: 4,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    Pico Status: {picoStatus}
                </Text>
                <Text style={{
                    fontSize: 18,
                    padding: 4,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    Program Task: {programTask}
                </Text>
                <Text style={{
                    fontSize: 18,
                    padding: 4,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    Chip Type: {chipType}
                </Text>
                <Text style={{
                    fontSize: 18,
                    padding: 4,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    Last Result: {lastResult}
                </Text>
                <Text style={{
                    fontSize: 18,
                    padding: 4,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    Recorded at: {lastResultTime}
                </Text>
            </TouchableOpacity>
        );
    }

    const DeviceLists = () => {
        return (
            <View style={{padding: 15, paddingTop: 0}}>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={discoveredList}
                        extraData={discoveredList}
                        renderItem={({item}) => unconnectedDevice(item)}
                        keyExtractor={(item) => item['id']}
                    />
                </View>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={connectedList}
                        extraData={connectedList}
                        renderItem={({item}) => connectedDevice(item)}
                        keyExtractor={(item) => item['peripheral']['id']}
                    />
                </View>
            </View>

        );
    }

    /*

            USER AUTHENTICATION, DATABASE RETRIEVAL

     */


    // update user info with current authenticated user info
    // also get organization info from user, update organization info
    useEffect(() => {
        if (auth().currentUser != null)
            // update user info based on database info
            database().ref('/users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                if (userSnapshot.val()) {
                    console.log('printing user info');
                    console.log(userSnapshot.val());

                    // get patient info for appropriate test type
                    let patient = null;
                    if (selectedTest === 'COVID') {
                        if (userSnapshot.val()['organization'] ) {
                            patient = database().ref('/organizations/' + userSnapshot.val()['organization']  + '/patients/covid/' + patientKeyCOVID);
                        } else {
                            patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID);
                        }
                    } else if (selectedTest === 'Fibrinogen') {
                        if (userSnapshot.val()['organization'] ) {
                            patient = database().ref('/organizations/' + userSnapshot.val()['organization']  + '/patients/fibrinogen/' + patientKeyFibrinogen);
                        } else {
                            patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen);
                        }
                    }

                    // update data for patient for appropriate test type
                    patient.once('value', function (patientSnapshot) {
                        if (selectedTest === 'COVID') {
                            setPatientKeyCOVID(patientSnapshot.key);
                            setPatientDataCOVID(patientSnapshot.val());
                        } else if (selectedTest === 'Fibrinogen') {
                            setPatientKeyFibrinogen(patientSnapshot.key);
                            setPatientDataFibrinogen(patientSnapshot.val());
                        }
                    });
                }
            });
        else
            auth().signInAnonymously().then(() => {
                console.log('User signed in anonymously with uid ' + auth().currentUser.uid);
            }).catch(error => {
                console.error(error);
            });
    }, [isFocused]);

    /*

        COVID/FIBRINOGEN SELECTION BAR

     */

    const TestSelectBar = () => {
        return (
            <View style={format.testSelectBar}>
                <TouchableOpacity
                    style={(selectedTest === 'COVID') ? buttons.covidSelectButton : buttons.unselectedButton}
                    onPress={() => {
                        // change selected test and update the currently showing patient
                        setSelectedTest('COVID');
                    }}
                >
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(selectedTest === 'Fibrinogen') ? buttons.fibrinogenSelectButton : buttons.unselectedButton}
                    onPress={() => {
                        // change selected test and update the currently showing patient
                        setSelectedTest('Fibrinogen');
                    }}
                >
                    <Text style={fonts.selectButtonText}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /*

        PATIENT SELECTOR AND MODAL

     */

    const PatientSelector = () => {
        const [patients, setPatients] = useState([]),
            [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);

        const toggleViewPatientModal = () => {
            // if we are re-showing this modal, update patient list in case it has changed
            // case 1: is connected to organization (covid)
            //  - look in /users/patients/covid/
            // case 2: is not connected to organization (covid)
            //  - look in /organizations/orgKey/patients/covid/
            // case 3: is connected to organization (fibrinogen)
            //  - look in /users/patients/fibrinogen/
            // case 4: is not connected to organization (fibrinogen)
            //  - look in /organizations/orgKey/patients/fibrinogen/
            if (!viewPatientModalVisible) {
                let patients = null;

                database().ref('/users/' + auth().currentUser.uid).once('value').then(userSnapshot => {
                    if (selectedTest === 'COVID') {
                        if (userSnapshot.val()['organization']) {
                            patients = database().ref('/organizations/' + userSnapshot.val()['organization'] + '/patients/covid/').orderByChild('name')
                        } else {
                            patients = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/').orderByChild('name');
                        }
                    } else if (selectedTest === 'Fibrinogen') {
                        if (userSnapshot.val()['organization']) {
                            patients = database().ref('/organizations/' + userSnapshot.val()['organization'] + '/patients/fibrinogen/').orderByChild('name')
                        } else {
                            patients = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/').orderByChild('name');
                        }
                    }

                    patients.once('value').then(snapshot => {
                        if (snapshot.val()) {
                            let patientList = [];
                            snapshot.forEach(function (data) {
                                patientList.push({key: data.key, label: data.val().name});
                            });
                            setPatients(patientList);
                            console.log(patientList);
                        }
                    });
                });
            }

            setViewPatientModalVisible(!viewPatientModalVisible);
        }


        return (
            <View>
                <ModalSelector
                    data={patients}
                    visible={viewPatientModalVisible}
                    onCancel={() => {toggleViewPatientModal()}}
                    customSelector={
                        <View>
                            <TouchableOpacity
                                onPress={() => toggleViewPatientModal()}
                                style={format.selectPatientBarContainer}
                            >
                                <Text style={fonts.username}>
                                    {
                                        (selectedTest === 'COVID') ?
                                            (patientDataCOVID === null) ? 'Select Patient' : patientDataCOVID.name
                                            :
                                            (patientDataFibrinogen === null) ? 'Select Patient' : patientDataFibrinogen.name
                                    }
                                </Text>
                                <IconE style={fonts.username}
                                       name={viewPatientModalVisible ? 'chevron-up' : 'chevron-down'} size={34}
                                />
                            </TouchableOpacity>
                        </View>
                    }
                    onChange={(option) => {
                        database().ref('/users/' + auth().currentUser.uid).once('value').then(userSnapshot => {
                            // get patient info for appropriate test type
                            let patient = null;
                            if (selectedTest === 'COVID') {
                                if (userSnapshot.val()['organization']) {
                                    patient = database().ref('/organizations/' + userSnapshot.val()['organization'] + '/patients/covid/' + option.key);
                                } else {
                                    patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + option.key);
                                }
                            } else if (selectedTest === 'Fibrinogen') {
                                if (userSnapshot.val()['organization']) {
                                    patient = database().ref('/organizations/' + userSnapshot.val()['organization'] + '/patients/fibrinogen/' + option.key);
                                } else {
                                    patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + option.key);
                                }
                            }

                            // update data for patient for appropriate test type
                            patient.once('value').then(patientSnapshot => {
                                if (selectedTest === 'COVID') {
                                    setPatientDataCOVID(patientSnapshot.val());
                                    setPatientKeyCOVID(patientSnapshot.key);
                                } else if (selectedTest === 'Fibrinogen') {
                                    setPatientDataFibrinogen(patientSnapshot.val());
                                    setPatientKeyFibrinogen(patientSnapshot.key);
                                }
                            }).then(() => {
                                console.log('patient key: ' + option.key);
                                console.log('patient ref: ' + patient.toString());
                                console.log('patientKeyCOVID: ' + patientKeyCOVID);
                                console.log('patientKeyFibrinogen: ' + patientKeyFibrinogen);
                            });
                        });
                    }}
                    optionContainerStyle={{
                        backgroundColor: '#111',
                        border: 0
                    }}
                    optionTextStyle={{
                        color: '#444',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }}
                    optionStyle={{
                        padding: 20,
                        backgroundColor: '#eee',
                        borderRadius: 100,
                        margin: 5,
                        marginBottom: 15,
                        borderColor: '#222'
                    }}
                    cancelText={'Cancel'}
                    searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                    searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                    listType={'FLATLIST'}
                />
            </View>
        );
    }

    /*

        LOG A TEST RESULT

     */

    const log_result = (testResultValue) => {
        // update user info based on database info
        database().ref('/users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
            if (userSnapshot.val()) {
                console.log('printing user info');
                console.log(userSnapshot.val());
                console.log('printing patient key fibrinogen');
                console.log(patientKeyFibrinogen);

                if (userSnapshot.val()['organization']) {
                    if (selectedTest === 'COVID') {
                        const testReference = database().ref('/organizations/' + userSnapshot.val()['organization'] + '/patients/covid/' + patientKeyCOVID + '/results/').push();
                        const date = new Date();
                        testReference
                            .set({
                                result: testResultValue,
                                time: date.toISOString()
                            })
                            .then(() => console.log('Added entry for /organizations/' + userSnapshot.val()['organization'] + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
                    } else if (selectedTest === 'Fibrinogen') {
                        const testReference = database().ref('/organizations/' + userSnapshot.val()['organization'] + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/').push();
                        const date = new Date();
                        testReference
                            .set({
                                result: testResultValue,
                                time: date.toISOString()
                            })
                            .then(() => console.log('Added entry for /organizations/' + userSnapshot.val()['organization'] + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/' + testReference.key));
                    }

                    Alert.alert('Success', 'Added test result to database');
                } else {
                    if (selectedTest === 'COVID') {
                        const testReference = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/').push();
                        const date = new Date();
                        testReference
                            .set({
                                result: testResultValue,
                                time: date.toISOString()
                            })
                            .then(() => console.log('Added entry for /users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
                    } else if (selectedTest === 'Fibrinogen') {
                        const testReference = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/').push();
                        const date = new Date();
                        testReference
                            .set({
                                result: testResultValue,
                                time: date.toISOString()
                            })
                            .then(() => console.log('Added entry for /users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/' + testReference.key));
                    }

                    Alert.alert('Success', 'Added test result to database');
                }

            }
        });
    }

    return (
        <SafeAreaView style={format.page}>
            <View style={{paddingTop: 15, marginBottom: -30}}>
                <Text style={fonts.heading}>Monitor Devices</Text>
            </View>
            <View style={{paddingTop: 15, flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={[fonts.subheading, {paddingRight: 25}]}>Automatic Pairing</Text>
                <Switch
                    trackColor={{false: "#444", true: "#5e9955"}}
                    thumbColor={autoConnectSwitch ? "#eeeeee" : "#eeeeee"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleAutoConnect}
                    value={autoConnectSwitch}
                />
            </View>
            <PatientSelector/>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <DeviceLists/>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}