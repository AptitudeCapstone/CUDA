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
import ModalSelector from "react-native-modal-selector-searchable";
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import {useIsFocused} from "@react-navigation/native";
import BleManager from 'react-native-ble-manager';


export const Monitor = ({navigation, route}) => {
    const isFocused = useIsFocused(),
        [selectedTest, setSelectedTest] = useState('Fibrinogen'),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        // configurable settings
        scanInterval = 2.0,
        // BLE objects
        BleManagerModule = NativeModules.BleManager,
        bleEmitter = new NativeEventEmitter(BleManagerModule),
        // UI and control states
        autoConnectByName = useRef(false),
        [autoConnectSwitch, setAutoConnectSwitch] = useState(autoConnectByName),
        [isScanning, setIsScanning] = useState(false),
        discoveredPeripherals = new Map(),
        [discoveredDevices, setDiscoveredDevices] = useState([]),
        connectedPeripherals = new Map(),
        [connectedDevices, setConnectedDevices] = useState([]),
        [selectedPeripheralID, setSelectedPeripheralID] = useState([]),
        serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13';

    /*

            BLE

            Single service with 6 characteristics
            1. Pico status (as string)
            2. Program task (unused right now) (as string)
            3. Sensor type (as int)
            4. Last result (as string)
            5. Last result timestamp (as string)

     */


    const picoStatusUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BA",
        programTaskUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BB",
        chipTypeUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BD",
        lastResultUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BE",
        lastResultTimeUUID = "04CB0EB1-8B58-44D0-91E4-080AF33438BF",
        characteristics = [
            picoStatusUUID,
            programTaskUUID,
            chipTypeUUID,
            lastResultUUID,
            lastResultTimeUUID
        ];

    /*

            BLUETOOTH HANDLER AND HELPER FUNCTIONS

     */

    // BLE mount and unmount event handler
    useEffect(() => {
        console.debug('Initializing BLE');

        // Initialize BLE module
        BleManager.start({showAlert: false}).then(r => {
            // Add ble listeners on mount
            bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleEmitter.addListener('BleManagerStopScan', handleStopScan);
            bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleEmitter.addListener('BleManagerConnectPeripheral', handleConnectedPeripheral);
            bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

            scanDevices();

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
            console.debug('Releasing BLE');
            bleEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
            bleEmitter.removeAllListeners('BleManagerStopScan');
            bleEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
            bleEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
        };
    }, []);

    // Device discovery handler
    const handleDiscoverPeripheral = (peripheral) => {
        if (!connectedPeripherals.has(peripheral.id)
            && (peripheral.name === 'raspberrypi' || String(peripheral.name).includes('AMS-'))) {

            // Update map of all discovered peripherals
            discoveredPeripherals.set(peripheral.id, peripheral);
            console.debug('BLE: Aptitude device discovered with name ' + getPeripheralName(peripheral));

            // If auto connect is on, connect to the device and update list of connected devices
            if (autoConnectByName.current) {
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
                // Add device to map of connected peripherals
                connectedPeripherals.set(peripheral.id, peripheral);

                // Remove device from map of discovered peripherals
                discoveredPeripherals.delete(peripheral.id);
            }).catch(err => {
                print('BLE: Error connecting to peripheral - ' + err)
            });
        }
    }

    const handleConnectedPeripheral = (peripheralID) => {
        subscribeToUpdates(peripheralID);
        console.debug('BLE: established connection with new device: ', peripheralID);
    };

    // handle disconnected peripheral
    const handleDisconnectedPeripheral = (data) => {
        let peripheral = connectedPeripherals.get(data.peripheral);

        if (peripheral) {
            // add to list of discovered devices
            discoveredPeripherals.set(peripheral.id, peripheral);
            // remove from list of connected devices
            connectedPeripherals.delete(peripheral.id);
        }

        console.debug('BLE: Closed connection from ', data);
    }

    const toggleAutoConnect = () => {
        let newState = !autoConnectByName.current;
        setAutoConnectSwitch(newState);
        autoConnectByName.current = newState;
        console.debug('BLE: Auto-connect has been toggled to ' + newState);
    }

    // Scan for BLE devices
    const scanDevices = () => {
        console.debug('BLE: Attempting new scan with auto-connect set to ' + autoConnectByName.current);

        if (isScanning) {
            console.debug('BLE: Scan in progress - cannot start new scan');
            return;
        }

        // Clear current map of discovered peripherals
        discoveredPeripherals.clear();

        // Re-scan with the desired interval
        BleManager.scan([], scanInterval, false)
            .then(() => {
                setIsScanning(true);
            }).catch((err) => {
                console.error(err);
        });
    };

    // Handle end of BLE device scan
    const handleStopScan = () => {
        console.debug('BLE: Finished last scan');
        setIsScanning(false);
        setDiscoveredDevices(Array.from(discoveredPeripherals.values()));
        setConnectedDevices(Array.from(connectedPeripherals.values()));
    };

    // Periodically scan for new devices
    useEffect(() => {
        const interval = setInterval(() => {
            scanDevices();
        }, scanInterval * 1000);
        return () => clearInterval(interval);
    }, []);

    const isPeripheralConnected = (peripheral) => {
        let connected = false;

        BleManager.isPeripheralConnected(peripheral.id, [])
            .then((isConnected) => {
                connected = isConnected;
            });

        return connected;
    }

    // Get name of an advertised peripheral
    const getPeripheralName = (item) => {
        if (item.advertising && item.advertising.localName) {
            return item.advertising.localName;
        } else {
            return item.name;
        }
    };

    // Retrieve services and start notifications on the peripheral for all 6 characteristics
    const subscribeToUpdates = (update) => {
        BleManager.retrieveServices(update['peripheral']).then((peripheralInfo) => {
            for(let charUUID of characteristics) {
                BleManager.startNotification(update['peripheral'], serviceUUID, charUUID)
                    .catch(error => {
                        console.debug('BLE: Error subscribing', error);
                    });
            }

            console.log('BLE: Subscribed to updates on peripheral', update['peripheral']);
        });
    };

    // Characteristic update handler
    const handleUpdateValueForCharacteristic = (update) => {
        console.debug(update);

        if (update && update.value) {
            console.debug('BLE: characteristic update received' + '\n' +
                '        with value of ' + update.value + '\n' +
                '        from device ' + update['peripheral'] + '\n' +
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
            console.debug("BLE: Unrecognized bluetooth packet received");
        }
    };

    /*
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                console.debug("BLE: current connection count = " + peripheralsArray.length);
            });
             */


    /*

        DEVICE LIST DISPLAY

    */

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
                <View style={{paddingBottom: 4}}>
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
                        extraData={discoveredDevices}
                        renderItem={({item}) => unconnectedDevice(item)}
                        keyExtractor={(item) => item.id}
                    />
                </View>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={connectedDevices}
                        extraData={connectedDevices}
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
                    thumbColor={autoConnectByName.current ? "#eeeeee" : "#eeeeee"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleAutoConnect}
                    value={autoConnectByName.current}
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