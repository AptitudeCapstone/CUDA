import React, {useEffect, useState} from 'react';
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
import ModalSelector from "react-native-modal-selector-searchable";
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import {useIsFocused} from "@react-navigation/native";
import BleManager from 'react-native-ble-manager';
import {stringToBytes} from 'convert-string';

const Buffer = require('buffer/').Buffer;


export const Monitor = ({navigation, route}) => {
    const isFocused = useIsFocused(),
        [selectedTest, setSelectedTest] = useState('Fibrinogen'),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        // configurable settings
        scanInterval = 10.0,
        // BLE objects
        BleManagerModule = NativeModules.BleManager,
        bleEmitter = new NativeEventEmitter(BleManagerModule),
        // UI and control states
        [scanEnabled, setScanEnabled] = useState(true),
        [autoConnectByName, setAutoConnectByName] = useState(true),
        [isScanning, setIsScanning] = useState(false),
        discoveredPeripherals = new Map(),
        [discoveredDevices, setDiscoveredDevices] = useState([]),
        connectedPeripherals = new Map(),
        [connectedDevices, setConnectedDevices] = useState([]),
        [selectedPeripheralID, setSelectedPeripheralID] = useState([]),
        serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13';

    /*

        BLE

     */

    // Single service with 6 characteristics
    //  1. state characteristic (0 = idle, 1 = test in progress)
    const picoStatusUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BA";
    //  2. program task (unused right now)
    const programTaskUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BB";
    //  4. sensor type (0 = no sensor, 1 = covid sensor, 2 = fibrinogen sensor)
    const chipTypeUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BD";
    //  5. most recent result (numerical value of last result, 0 initially)
    const lastResultUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BE";
    //  6. test request (0 = empty request queue, 1 = test has been requested)
    const lastResultTimeUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BF";

    // HANDLER / HELPER FUNCTIONS

    const isPeripheralConnected = (peripheral) => {
        let connected = false;

        BleManager.isPeripheralConnected(peripheral.id, [])
            .then((isConnected) => {
                connected = isConnected;
            });

        return connected;
    }

    // get advertised peripheral local name (if exists). default to peripheral name
    const getPeripheralName = (item) => {
        if (item.advertising) {
            if (item.advertising.localName) {
                return item.advertising.localName;
            }
        }

        return item.name;
    };

    const handleDiscoverPeripheral = (peripheral) => {
        if (!connectedPeripherals.has(peripheral.id) && (peripheral.name === 'raspberrypi' || String(peripheral.name).includes('AMS-'))) {
            // make a map of all discovered peripherals
            discoveredPeripherals.set(peripheral.id, peripheral);
            setDiscoveredDevices(Array.from(discoveredPeripherals.values()));
            // if auto connect is on, connect to the device and update list of connected devices
            if (autoConnectByName) {
                if(!isPeripheralConnected(peripheral)) {
                    connectPeripheral(peripheral);
                }
            }
        }
    };

    const connectPeripheral = (peripheral) => {
        if (!peripheral) {
            return;
        }

        if (!isPeripheralConnected(peripheral)) {
            BleManager.connect(peripheral.id).then(() => {
                // add to connected peripherals
                connectedPeripherals.set(peripheral.id, peripheral);
                setConnectedDevices(Array.from(connectedPeripherals.values()));
                // remove from discovered peripherals
                discoveredPeripherals.delete(peripheral.id);
                setDiscoveredDevices(Array.from(discoveredPeripherals.values()))
            }).catch(e => {
                print('Error connecting: ' + e)
            });
        }
    }

    const handleConnectedPeripheral = (peripheralID) => {
        console.log('connected to peripheral', peripheralID);
        subscribeToUpdates(peripheralID);
    };

    // handle disconnected peripheral
    const handleDisconnectedPeripheral = (data) => {
        console.log('disconnected from ', data);

        let peripheral = connectedPeripherals.get(data.peripheral);

        if (peripheral) {
            // add to discovered devices
            discoveredPeripherals.set(peripheral.id, peripheral);
            setDiscoveredDevices(Array.from(discoveredPeripherals.values()));
            // remove from connected devices
            connectedPeripherals.delete(peripheral.id);
            setConnectedDevices(Array.from(connectedPeripherals.values()));
        }
    };

    const subscribeToUpdates = (update) => {
        // retrieve services and start notifications on the peripheral for all 6 characteristics
        console.log('Subscribing to updates on peripheral', update.peripheral);
        BleManager.retrieveServices(update.peripheral).then((peripheralInfo) => {
            BleManager.startNotification(update.peripheral, serviceUUID, picoStatusUUID)
                .catch(error => {
                    console.log('Error subscribing', error);
                });

            BleManager.startNotification(update.peripheral, serviceUUID, programTaskUUID)
                .catch(error => {
                    console.log('Error subscribing', error);
                });


            BleManager.startNotification(update.peripheral, serviceUUID, chipTypeUUID)
                .catch(error => {
                    console.log('Error subscribing', error);
                });

            BleManager.startNotification(update.peripheral, serviceUUID, lastResultUUID)
                .catch(error => {
                    console.log('Error subscribing', error);
                });

            BleManager.startNotification(update.peripheral, serviceUUID, lastResultTimeUUID)
                .catch(error => {
                    console.log('Error subscribing', error);
                });
        });
    };

    // start to scan peripherals
    const startScan = () => {
        if (isScanning)
            return;

        // first, clear existing peripherals
        discoveredPeripherals.clear();
        setDiscoveredDevices(Array.from(discoveredPeripherals.values()));

        // then re-scan it
        BleManager.scan([], scanInterval, false)
            .then(() => {
                setIsScanning(true);
            }).catch((err) => {
                console.error(err);
        });
    };

    // handle stop scan event
    const handleStopScan = () => {
        setIsScanning(false);
    };

    const start_test_on_selected_device = () => {
        console.log('attempting to start test on device with id ' + selectedPeripheralID);
        BleManager.write(selectedPeripheralID, serviceUUID, lastResultTimeUUID, stringToBytes('1'))
            .then((res) => {
                console.log('Sending test request to device ' + selectedPeripheralID.toString());
            })
            .catch((error) => {
                console.log('Error sending test request to device ' + selectedPeripheralID.toString());
                console.log(error);
            });
    }

    const handleUpdateValueForCharacteristic = (update) => {
        // determine which characteristic update is being received

        console.log(update);
        //setReadVal(data.toString());

        if(update && update.value) {
            console.log('updated value received: ' + update.value + '\n' +
                '        from device ' + update.peripheral + '\n' +
                '        on characteristic ' + update.characteristic);

            if (update.characteristic === chipTypeUUID) {
                const data = update.value[0].toString();
                if (data === "-1") {
                    Alert.alert("Chip removal detected", "If a test was in progress, please wait before inserting the chip again");
                } else if (data === "7") {
                    Alert.alert("Chip insertion detected", "Please wait while COVID testing begins");
                } else {
                    Alert.alert("Chip insertion detected", "Please insert the sample into the collector and wait");
                }
            }
        } else {
            console.log("Unrecognized bluetooth packet received");
        }
        

        /*
        BleManager.read(update.peripheral, update.service, update.characteristic)
            .then((res) => {
                if (res) {
                    const buffer = Buffer.from(res);
                    const data = buffer.toString();
                    console.log('updated value: ' + data + ' (from device ' + update.peripheral + ' on characteristic ' + update.characteristic + ')');
                    setReadVal(data.toString());
                    //alert(data);
                }
            }).catch((error) => {
            alert(error);
        });

         */
    }

    // periodically scans for new devices
    useEffect(() => {
        const interval = setInterval(() => {
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                // Success code
                console.log("connected peripherals: " + peripheralsArray.length);
            });

            if (scanEnabled) {
                startScan();
            }
        }, scanInterval * 1000);
        return () => clearInterval(interval);
    }, []);

    // mount and unmount event handler
    useEffect(() => {
        console.log('Initializing BLE');

        // initialize BLE modules
        BleManager.start({showAlert: false}).then(r => {
            // add ble listeners on mount
            bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleEmitter.addListener('BleManagerStopScan', handleStopScan);
            bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleEmitter.addListener('BleManagerConnectPeripheral', handleConnectedPeripheral);
            bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

            startScan();

            // check location permission only for android device
            if (Platform.OS === 'android' && Platform.Version >= 23) {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
                    if (r1) return;

                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
                        if (r2) return;
                    });
                });
            }
        });

        // remove ble listeners on unmount
        return () => {
            console.log('Releasing BLE');
            bleEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
            bleEmitter.removeAllListeners('BleManagerStopScan');
            bleEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
            bleEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
        };
    }, []);


    /*

        DEVICE LIST DISPLAY

    */

    const [writeVal, setWriteVal] = useState('test'),
        [readVal, setReadVal] = useState('none');

    const unconnectedDevice = (item) => {
        let iconName = '';
        if (item.rssi) {
            if (item.rssi >= -50) {
                iconName = 'signal-cellular-3';
            } else if (item.rssi >= -75) {
                iconName = 'signal-cellular-2';
            } else if (item.rssi >= -85) {
                iconName = 'signal-cellular-1';
            }
        }

        return (
            <TouchableOpacity
                style={{
                    margin: 0,
                    alignItems: 'center',
                    padding: 16,
                    paddingBottom: 13
                }}
                onPress={() => {
                    setSelectedPeripheralID(item.id);
                }}
            >
                <View style={{borderRadius: 5000, paddingBottom: 4}}>
                    {iconName !== '' &&
                    <IconMCI name={iconName} size={30}
                             color="#fff"/>
                    }
                </View>
                <Text style={{
                    fontSize: 14,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>{getPeripheralName(item)}</Text>
            </TouchableOpacity>
        );
    }

    const connectedDevice = (item) => {
        let iconName = '';
        if (item.rssi) {
            if (item.rssi >= -50) {
                iconName = 'signal-cellular-3';
            } else if (item.rssi >= -75) {
                iconName = 'signal-cellular-2';
            } else if (item.rssi >= -85) {
                iconName = 'signal-cellular-1';
            }
        }

        return (
            <TouchableOpacity
                style={{
                    backgroundColor: '#333',
                    margin: 0,
                    alignItems: 'center',
                    padding: 16,
                    paddingBottom: 17,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: '#555'
                }}
                onPress={() => {
                    setSelectedPeripheralID(item.id);
                }}
            >
                <View style={{borderRadius: 5000, paddingBottom: 4}}>
                    {iconName !== '' &&
                    <IconMCI name={iconName} size={30}
                             color="#fff"/>
                    }
                </View>
                <Text style={{
                    fontSize: 14,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>{getPeripheralName(item)}</Text>
            </TouchableOpacity>
        );
    }

    const DeviceLists = () => {
        return (
            <View style={{padding: 15, paddingTop: 0}}>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={discoveredDevices}
                        renderItem={({item}) => unconnectedDevice(item)}
                        keyExtractor={(item) => item.id}
                    />
                </View>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={connectedDevices}
                        renderItem={({item}) => connectedDevice(item)}
                        keyExtractor={(item) => item.id}
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
                    onCancel={() => {
                        toggleViewPatientModal();
                    }}
                    customSelector={<View>
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
                    </View>}
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
            <TestSelectBar/>
            <PatientSelector/>
            <View style={{paddingTop: 15, flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={fonts.username}>Bluetooth Scanning</Text>
                <Switch
                    trackColor={{false: "#444", true: "#5e9955"}}
                    thumbColor={scanEnabled ? "#eeeeee" : "#eeeeee"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(val) => {
                        const newVal = !scanEnabled;
                        setScanEnabled(val);
                        console.log('is scanning: ' + newVal);
                    }}
                    value={scanEnabled}
                />
                <Text style={fonts.username}>Connect Automatically</Text>
                <Switch
                    trackColor={{false: "#444", true: "#5e9955"}}
                    thumbColor={autoConnectByName ? "#eeeeee" : "#eeeeee"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(val) => {
                        const newVal = !autoConnectByName;
                        setAutoConnectByName(val);
                    }}
                    value={scanEnabled}
                />
            </View>
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