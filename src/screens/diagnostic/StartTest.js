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


export const StartTest = ({navigation, route}) => {
    const isFocused = useIsFocused(),
        [value, setValue] = useState(null),
        [selectedTest, setSelectedTest] = useState('COVID'),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        [userInfo, setUserInfo] = useState(null),
        [orgInfo, setOrgInfo] = useState(null);

    /*

        BLE

    */

    // configurable settings
    const autoConnectByName = true;
    const scanInterval = 10.0;
    // BLE objects
    const BleManagerModule = NativeModules.BleManager;
    const bleEmitter = new NativeEventEmitter(BleManagerModule);
    // UI and control states
    const [scanEnabled, setScanEnabled] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const allPeripherals = new Map();
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const connectedPeripherals = new Map();
    const [connectedDevices, setConnectedDevices] = useState([]);
    const [selectedPeripheralID, setSelectedPeripheralID] = useState([]);
    // for testing UI
    const [testMode, setTestMode] = useState('write');

    const serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13';
    const characteristicUUID = '04cb0eb1-8b58-44d0-91e4-080af33438bb';

    // HANDLER / HELPER FUNCTIONS

    const connectPeripheral = (peripheral) => {
        if (!peripheral) {
            return;
        }

        if (!isPeripheralConnected(peripheral)) {
            BleManager.connect(peripheral.id).then(() => {
                // update connected attribute
                updatePeripheral(peripheral, (p) => {
                    p.connected = true;
                    return p;
                });
            }).catch(e => {
                print('Error connecting: ' + e)
            });
        }
    }

    const isPeripheralConnected = (peripheral) => {
        let connected = false;

        BleManager.isPeripheralConnected(
            peripheral.id,
            []
        ).then((isConnected) => {
            connected = isConnected;
        });

        return connected;
    }

    const subscribeToUpdates = (update) => {
        console.log('Subscribing to updates on peripheral', update.peripheral);

        BleManager.retrieveServices(update.peripheral).then((peripheralInfo) => {
            // start notifications on the peripheral
            BleManager.startNotification(update.peripheral, serviceUUID, "04cb0eb1-8b58-44d0-91e4-080af33438ba").catch(error => {
                console.log('Error subscribing', error);
            });

            BleManager.startNotification(update.peripheral, serviceUUID, "04cb0eb1-8b58-44d0-91e4-080af33438bb").catch(error => {
                console.log('Error subscribing', error);
            });

            BleManager.startNotification(update.peripheral, serviceUUID, "04cb0eb1-8b58-44d0-91e4-080af33438bc").catch(error => {
                console.log('Error subscribing', error);
            });

            BleManager.startNotification(update.peripheral, serviceUUID, "04cb0eb1-8b58-44d0-91e4-080af33438bd").catch(error => {
                console.log('Error subscribing', error);
            });

            BleManager.startNotification(update.peripheral, serviceUUID, "04cb0eb1-8b58-44d0-91e4-080af33438be").catch(error => {
                console.log('Error subscribing', error);
            });

            BleManager.startNotification(update.peripheral, serviceUUID, "04cb0eb1-8b58-44d0-91e4-080af33438bf").catch(error => {
                console.log('Error subscribing', error);
            });
        });
    };

    const sendRequest = (peripheralID, writeVal) => {
        if(testMode === 'write') {
            writePeripheral(peripheralID, writeVal);
        } else if(testMode === 'read') {
            readPeripheral(peripheralID);
        } else {
            subscribeToUpdates(peripheralID);
        }
    };

    // write value to peripheral writePeripheral(peripheral, writeVal)
    const writePeripheral = (peripheralID, writeVal) => {
        // ===== test write data
        const payload = writeVal.toString();
        const payloadBytes = stringToBytes(payload);
        console.log('writing payload:', payload);

        BleManager.write(peripheralID, serviceUUID, characteristicUUID, payloadBytes)
            .then((res) => {
                console.log('write response', res);
            })
            .catch((error) => {
                console.log('write err', error);
            });
    };

    const readPeripheral = (peripheralID) => {
        BleManager.read(peripheralID, serviceUUID, characteristicUUID)
            .then((res) => {
                if (res) {
                    const buffer = Buffer.from(res);
                    const data = buffer.toString();
                    console.log('read value: ' + res + ' from device ' + peripheralID);
                    setReadVal(res);
                    //alert(data);
                }
            }).catch((error) => {
            alert(error);
        });
    };

    // handle discovered peripheral
    const handleDiscoverPeripheral = (peripheral) => {
        if (peripheral.name === 'raspberrypi' || peripheral.name === 'CUDA Tester') {
            // make a map of all discovered peripherals
            allPeripherals.set(peripheral.id, peripheral);
            setDiscoveredDevices(Array.from(allPeripherals.values()));
            // if auto connect is on, connect to the device and update list of connected devices
            if (autoConnectByName) {
                if(!isPeripheralConnected(peripheral)) {
                    connectPeripheral(peripheral);
                }
            }
        }
    };

    const handleUpdateValueForCharacteristic = (update) => {
        // BLE enforces 20 byte limit on notification values
        // so, we perform a full read when an update occurs
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
    }

    // handle stop scan event
    const handleStopScan = () => {
        setIsScanning(false);
    };

    const handleConnectedPeripheral = (peripheralID) => {
        console.log('connected to peripheral', peripheralID);
        subscribeToUpdates(peripheralID);
    };

    // handle disconnected peripheral
    const handleDisconnectedPeripheral = (data) => {
        console.log('Disconnected from ', data);
        /*
        let peripheral = allPeripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            allPeripherals.set(peripheral.id, peripheral);
            setDiscoveredDevices(Array.from(allPeripherals.values()));
        }

         */
    };


    // update stored peripherals
    const updatePeripheral = (peripheral, callback) => {
        let p = allPeripherals.get(peripheral.id);
        if (!p) {
            return;
        }

        p = callback(p);
        allPeripherals.set(peripheral.id, p);
        setDiscoveredDevices(Array.from(allPeripherals.values()));
    };

    // get advertised peripheral local name (if exists). default to peripheral name
    const getPeripheralName = (item) => {
        if (item.advertising) {
            if (item.advertising.localName) {
                return item.advertising.localName;
            }
        }

        return item.name;
    };

    /*

        BLE ROUTINE
        - SCAN ENABLED: TRUE
            - UPDATE DISCOVERED PERIPHERALS LIST
            - IF AUTO CONNECT BY NAME:
                - CONNECT TO DEVICE, ALSO ADD TO CONNECTED PERIPHERALS LIST

        - TAP DEVICE FROM CONNECTED LIST
            - CONNECT TO DEVICE, ALSO ADD TO CONNECTED PERIPHERALS LIST
            - SUBSCRIBE TO UPDATES FROM THE DEVICE

        - TEMP TESTING UI
            - WRITE TO THE


     */


    // periodically scans for new devices
    useEffect(() => {
        const interval = setInterval(() => {
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                // Success code
                console.log("Connected peripherals: " + peripheralsArray.length);
            });

            if (scanEnabled) {
                startScan();
            }
        }, scanInterval * 1000);
        return () => clearInterval(interval);
    }, []);

    // start to scan peripherals
    const startScan = () => {
        if (isScanning)
            return;

        // first, clear existing peripherals
        allPeripherals.clear();
        setDiscoveredDevices(Array.from(allPeripherals.values()));

        // then re-scan it
        BleManager.scan([], scanInterval, false)
            .then(() => {
                setIsScanning(true);
            }).catch((err) => {
                console.error(err);
        });
    };

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

                        console.log('User refuse');
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

    const [writeVal, setWriteVal] = useState('test');
    const [readVal, setReadVal] = useState('none');
    const [peripheral, setPeripheral] = useState(null);

    const BluetoothTester = () => {
        return (
            <View style={{borderWidth: 1, borderColor: '#555', padding: 15, margin: 15, borderRadius: 10}}>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <TouchableOpacity
                        style={(testMode !== 'read') ? buttons.unselectedButton : buttons.covidSelectButton}
                        onPress={() => setTestMode('read')}
                    >
                        <Text style={fonts.selectButtonText}>Read</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(testMode !== 'write') ? buttons.unselectedButton : buttons.covidSelectButton}
                        onPress={() => setTestMode('write')}
                    >
                        <Text style={fonts.selectButtonText}>Write</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(testMode !== 'notify') ? buttons.unselectedButton : buttons.covidSelectButton}
                        onPress={() => setTestMode('notify')}
                    >
                        <Text style={fonts.selectButtonText}>Notify</Text>
                    </TouchableOpacity>
                </View>
                {
                    testMode === 'write' &&
                    <TextInput
                        style={{
                            margin: 15,
                            padding: 15,
                            color: '#eee',
                            borderColor: '#555',
                            borderWidth: 1,
                            borderRadius: 10
                        }}
                        onChangeText={setWriteVal}
                        value={writeVal}
                    />
                }
                {
                    testMode === 'read' &&
                    <Text style={[fonts.username, {padding: 20, textAlign: 'center'}]}>Most recent
                        value: {readVal}</Text>
                }
                <TouchableOpacity
                    style={[buttons.submitButton, {marginBottom: 10}]}
                    onPress={() => sendRequest(selectedPeripheralID)}
                >
                    <Text style={buttons.submitButtonText}>Send Request</Text>
                </TouchableOpacity>
            </View>
        )
    };


    const DeviceList = () => {
        return (
            <View>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={discoveredDevices}
                        renderItem={({item}) => {
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
                                    style={item === peripheral ? {
                                        backgroundColor: '#333',
                                        margin: 0,
                                        alignItems: 'center',
                                        padding: 16,
                                        paddingBottom: 17,
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: '#555'
                                    } : {
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

                        }}
                        keyExtractor={(item) => item.id}
                    />
                </View>
                <BluetoothTester/>
            </View>

        );
    }

    // update user info with current authenticated user info
    // also get organization info from user, update organization info
    useEffect(() => {
        if (auth().currentUser != null)
            // update user info based on database info
            database().ref('/users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                if (userSnapshot.val()) {
                    setUserInfo(userSnapshot.val());
                    if (userSnapshot.val().organization === undefined) {
                        setOrgInfo(null);
                    } else
                        database().ref('/organizations/' + userSnapshot.val().organization).once('value', function (orgSnapshot) {
                            setOrgInfo(orgSnapshot.val());
                        });

                    // get patient info for appropriate test type
                    let patient = null;
                    if (selectedTest === 'COVID') {
                        if (orgInfo === null) {
                            patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID);
                        } else {
                            patient = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID);
                        }
                    } else if (selectedTest === 'Fibrinogen') {
                        if (orgInfo === null) {
                            patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen);
                        } else {
                            patient = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen);
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

                if (selectedTest === 'COVID') {
                    if (orgInfo === null) {
                        patients = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/').orderByChild('name');
                    } else {
                        patients = database().ref('/organizations/' + userInfo.organization + '/patients/covid/').orderByChild('name')
                    }
                } else if (selectedTest === 'Fibrinogen') {
                    if (orgInfo === null) {
                        patients = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/').orderByChild('name');
                    } else {
                        patients = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/').orderByChild('name')
                    }
                }

                patients.once('value', function (snapshot) {
                    if (snapshot.val()) {
                        let patientList = [];
                        snapshot.forEach(function (data) {
                            patientList.push({key: data.key, label: data.val().name});
                        });
                        setPatients(patientList);
                    }
                });
            }

            setViewPatientModalVisible(!viewPatientModalVisible);
        }

        const PatientSelectorButton = () => {
            return (
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
            );
        }

        // @ts-ignore
        return (
            <View>
                <ModalSelector
                    data={patients}
                    visible={viewPatientModalVisible}
                    onCancel={() => {
                        toggleViewPatientModal();
                    }}
                    customSelector={<View/>}
                    onChange={async (option) => {
                        // get patient ID for the appropriate test type
                        if (selectedTest === 'COVID')
                            setPatientKeyCOVID(option.key);
                        else if (selectedTest === 'Fibrinogen')
                            setPatientKeyFibrinogen(option.key);

                        // get patient info for appropriate test type
                        let patient = null;
                        if (selectedTest === 'COVID') {
                            if (orgInfo === null) {
                                patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + option.key);
                            } else {
                                patient = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + option.key);
                            }
                        } else if (selectedTest === 'Fibrinogen') {
                            if (orgInfo === null) {
                                patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + option.key);
                            } else {
                                patient = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + option.key);
                            }
                        }

                        // update data for patient for appropriate test type
                        await patient.once('value', function (patientSnapshot) {
                            if (selectedTest === 'COVID') {
                                setPatientKeyCOVID(patientSnapshot.key);
                                setPatientDataCOVID(patientSnapshot.val());
                            } else if (selectedTest === 'Fibrinogen') {
                                setPatientKeyFibrinogen(patientSnapshot.key);
                                setPatientDataFibrinogen(patientSnapshot.val());
                            }
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
                <PatientSelectorButton/>
            </View>
        );
    }

    /*

        LOG A TEST RESULT

     */

    const log_result = () => {
        if (orgInfo === null) {
            if (selectedTest === 'COVID') {
                const testReference = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/').push();
                const date = new Date();
                testReference
                    .set({
                        result: value,
                        time: date.toISOString()
                    })
                    .then(() => console.log('Added entry for /users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
            } else if (selectedTest === 'Fibrinogen') {
                const testReference = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/').push();
                const date = new Date();
                testReference
                    .set({
                        result: value,
                        time: date.toISOString()
                    })
                    .then(() => console.log('Added entry for /users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/' + testReference.key));
            }

            Alert.alert('Success', 'Added test result to database');
        } else {
            if (selectedTest === 'COVID') {
                const testReference = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/').push();
                const date = new Date();
                testReference
                    .set({
                        result: value,
                        time: date.toISOString()
                    })
                    .then(() => console.log('Added entry for /organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
            } else if (selectedTest === 'Fibrinogen') {
                const testReference = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/').push();
                const date = new Date();
                testReference
                    .set({
                        result: value,
                        time: date.toISOString()
                    })
                    .then(() => console.log('Added entry for /organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
            }

            Alert.alert('Success', 'Added test result to database');
        }
    }

    return (
        <SafeAreaView style={format.page}>
            <View style={{padding: 15, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={fonts.username}>Scan for devices</Text>
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
            </View>
            <DeviceList/>
            <TestSelectBar/>
            <PatientSelector/>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View>
                    <Text style={fonts.heading}>Start a Test</Text>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={log_result}
                    >
                        <Text style={buttons.submitButtonText}>Record Result</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}