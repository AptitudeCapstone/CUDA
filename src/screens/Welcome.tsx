import React, {useEffect, useReducer, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {BleManager, Device} from "react-native-ble-plx";
import {DeviceCard} from "../components/DeviceCard";
import {Base64} from '../lib/base64';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconFo from 'react-native-vector-icons/Foundation';
import {useIsFocused} from "@react-navigation/native";
import database from "@react-native-firebase/database";
import ModalSelector from "react-native-modal-selector-searchable";

const manager = new BleManager();

const reducer = (
    state: Device[],
    action: { type: 'ADD_DEVICE'; payload: Device } | { type: 'CLEAR' },
): Device[] => {
    switch (action.type) {
        case 'ADD_DEVICE':
            const {payload: device} = action;

            // check if the detected device is not already added to the list
            if (device && !state.find((dev) => dev.id === device.id)) {
                return [...state, device];
            }
            return state;
        case 'CLEAR':
            return [];
        default:
            return state;
    }
};

const decodeBleString = (value: string | undefined | null): string => {
    if (!value) return '';
    return Base64.decode(value).charCodeAt(0);
};

export const Welcome = ({route, navigation}) => {
    // used to determine current bluetooth devices in range
    const [scannedDevices, dispatch] = useReducer(reducer, []);
    const [isScanning, setIsScanning] = useState(false);

    // used throughout pages to determine the currently synced organization
    const [connectedOrg, setConnectedOrg] = useState('');   // database key of the current organization
    const [connectedOrgName, setConnectedOrgName] = useState('');   // name of the current organization

    // used throughout pages to populate patient modal popups
    const [patients, setPatients] = useState([]);
    const [testPatientModalVisible, setTestPatientModalVisible] = useState(false);
    const [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);

    // for navigation
    const [currentPage, setCurrentPage] = useState(-1);
    const [currentSubpage, setCurrentSubpage] = useState(-1);
    const [currentVisibleSubNav, setCurrentVisibleSubNav] = useState(-1);

    // determines when page comes into focus
    const isFocused = useIsFocused();

    /*

        BLUETOOTH

     */

    // start to scan when page is open, destroy manager when done
    useEffect(() => {
        scanDevices();

        return () => {manager.destroy()};
    }, []);

    // scan for BLE devices
    const scanDevices = () => {
        // toggle activity indicator on
        setIsScanning(true);

        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) console.warn(error);

            // filter by name for 'raspberrypi'
            if (scannedDevice != null && scannedDevice.name == 'raspberrypi') {
                // stop scanning
                manager.stopDeviceScan();

                // turn off activity indicator
                setIsScanning(false);

                // connect to device
                scannedDevice
                    .connect()
                    .then((deviceData) => {
                        manager.onDeviceDisconnected(
                            deviceData.id,
                            (connectionError, connectionData) => {
                                if (connectionError) console.log(connectionError);

                                console.log(connectionData);
                                console.log('Device is disconnected. Restarting BLE device scan. ');
                                setIsScanning(true);
                                scanDevices();
                            },
                        );

                        return scannedDevice.discoverAllServicesAndCharacteristics();
                    })
                    .then(async (deviceObject) => {
                        console.log('deviceObject: ' + deviceObject);
                        // subscribe for the readable service
                        scannedDevice.monitorCharacteristicForService(
                            '00000001-710e-4a5b-8d75-3e5b444bc3cf',
                            '00000002-710e-4a5b-8d75-3e5b444bc3cf',
                            (error, characteristic) => {
                                if (error) {
                                    console.log('Error in monitorCharacteristicForService');
                                    console.log(error.message);
                                    return;
                                }

                                //console.log(characteristic.uuid, decodeBleString(characteristic.value));
                            },
                        );
                    })
                    .catch((error) => {
                        console.warn(error);
                    });

                // add to devices list using reducer
                dispatch({type: 'ADD_DEVICE', payload: scannedDevice});
            }
        });
    };

    /*

            NAVIGATION

     */

    const navigate = (pageNum, subpageNum, subNavNum) => {
        if (currentPage != pageNum)
            setCurrentPage(pageNum);

        if (currentSubpage != subpageNum)
            setCurrentSubpage(pageNum);

        if (currentVisibleSubNav != subNavNum)
            setCurrentVisibleSubNav(subNavNum);
    }

    const NavBar = () => {
        return(
            <View style={styles.topNavButtonContainer}>
                    <TouchableOpacity
                        style={currentPage == 0 ? styles.topNavBarButtonSelected : styles.topNavBarButton}
                        onPress={() => navigate(0, 0, 0)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconF name='user' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={currentPage == 1 ? styles.topNavBarButtonSelected : styles.topNavBarButton}
                        onPress={() => navigate(1, 0, 1)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconFo name='graph-bar' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Patient Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={currentPage == 2 ? styles.topNavBarButtonSelected : styles.topNavBarButton}
                        onPress={() => navigate(2, 0, 2)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconMI name='device-hub' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Devices</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={currentPage == 3 ? styles.topNavBarButtonSelected : styles.topNavBarButton}
                        onPress={() => navigate(3, 0, -1)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconMCI name='water' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Start Test</Text>
                    </TouchableOpacity>
            </View>
        );
    }

    const SubNavBar = () => {
        if(currentVisibleSubNav == 0)
            return(
                <View style={styles.subNavBarContainer}>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentSubpage(0)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconF name='user' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>My Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentSubpage(1)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconMI name='device-hub' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Sync with an Organization</Text>
                    </TouchableOpacity>

                </View>);
        else if(currentVisibleSubNav == 1)
            return(
                <View style={styles.subNavBarContainer}>

                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentSubpage(0)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconF name='user' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>COVID</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentSubpage(1)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconFo name='graph-bar' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Fibrinogen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconFo name='graph-bar' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>QR Codes</Text>
                    </TouchableOpacity>
                </View>
            );
        else if(currentVisibleSubNav == 2)
            if(scannedDevices.length == 0)
                return(
                    <View style={styles.subNavBarContainer}>
                        <View style={{flexDirection: 'row', paddingTop: 20, marginBottom: 16}}>
                            <Text style={{color: '#eee', fontSize: 14, marginTop: 14, marginBottom: -4}}>No devices found</Text>
                            <Text style={{marginLeft: 20, marginTop: 8, marginBottom: 0}}>
                                <ActivityIndicator color={'white'} size={32}/>
                            </Text>
                        </View>
                    </View>
                );
            else return (
                <View style={styles.subNavBarContainer}>
                    <FlatList
                        horizontal={true}
                        keyExtractor={(item) => item.id}
                        data={scannedDevices}
                        renderItem={({item}) => <DeviceCard device={item} navigation={navigation}/>}
                        contentContainerStyle={styles.subNavBarContainer}
                    />
                </View>
            );
        else
            return <View />;
    }

    /*

        ACCOUNT PAGE

     */

    // update synced org if it is passed as a route parameter
    useEffect(() => {
        if (route.params) {
            const {currentOrgName} = route.params;
            setConnectedOrgName(currentOrgName);
        }
    }, [isFocused]);

    const AccountPage = () => {
        const AccountWindow = () => {
            return (
                <View
                    style={styles.window}
                >
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.headingText}>Test Administer</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1,}}>
                            <Text style={styles.mediumText}>While it is not required, creating a test
                                administer account allows you to sync patient data with other apps and
                                retain data if the app is deleted</Text>
                        </View>
                    </View>
                    <View style={styles.navButtonContainer}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('CreateOrganization')}
                        >
                            <View style={styles.navIcon}>
                                <IconF name='user-plus' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>Create Administer Account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('ConnectOrganization')}
                        >
                            <View style={styles.navIcon}>
                                <IconF name='user' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>Login to an Existing Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }


        const ConnectWindow = () => {
            const disconnectFromOrg = () => {
                Alert.alert(
                    'Confirm',
                    'Are you sure you want to disconnect from ' + connectedOrgName + '? \n\nYou can always reconnect. ',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                setConnectedOrg('');
                                setConnectedOrgName('');
                            }
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ]
                );
            }

            return (
                <View
                    style={styles.window}
                >
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.headingText}>Connect</Text>
                        </View>
                    </View>
                    {connectedOrgName == '' ?
                        (
                            <View>
                                <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                    <View style={{flex: 1,}}>
                                        <Text style={styles.mediumText}>Connecting to an organization
                                            syncs patient data with all other apps from the
                                            organization</Text>
                                    </View>
                                </View>
                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.navButton}
                                        onPress={() => navigation.navigate('CreateOrganization')}
                                    >
                                        <View style={styles.navIcon}>
                                            <IconMCI name='database-plus' size={30} color='#fff'/>
                                        </View>
                                        <Text style={styles.navButtonText}>Create a New Organization</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.navButton}
                                        onPress={() => navigation.navigate('ConnectOrganization')}
                                    >
                                        <View style={styles.navIcon}>
                                            <IconMCI name='database-search' size={30} color='#fff'/>
                                        </View>
                                        <Text style={styles.navButtonText}>Connect to an Organization</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.mediumText}>Data is being synced
                                    with {connectedOrgName}</Text>
                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.navButton}
                                        onPress={disconnectFromOrg}
                                    >
                                        <View style={styles.navIcon}>
                                            <IconF name='user-minus' size={30} color='#fff'/>
                                        </View>
                                        <Text style={styles.navButtonText}>Disconnect
                                            from {connectedOrgName}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>)
                    }
                </View>
            );
        }


        if (currentPage == 0) {
            if(currentSubpage == 0)
                return (
                    <ScrollView style={styles.page}>
                        <View style={styles.page}>
                            <AccountWindow />
                        </View>
                    </ScrollView>
                );
            else if(currentSubpage == 1)
                return (
                    <ScrollView style={styles.page}>
                        <View style={styles.page}>
                            <ConnectWindow />
                        </View>
                    </ScrollView>
                );
        } else
            return <View/>


    }

    /*

        VIEW PATIENT DATA PAGE

     */

    const toggleViewPatientModal = (patientKey) => {
        if (viewPatientModalVisible) {
            database().ref('patients/' + patientKey).once('value', function (patient) {
                //verify that org with add code exists
                if (patient.val()) {
                    navigation.navigate('Patient', {
                        navigation,
                        patient_id: patientKey,
                        patient_qr_id: patient.val().qrId.toString(),
                        patient_name: patient.val().name,
                        patient_email: patient.val().email,
                        patient_phone: patient.val().phone.toString(),
                        patient_street_address_1: patient.val().addressLine1,
                        patient_street_address_2: patient.val().addressLine2,
                        patient_city: patient.val().city,
                        patient_state: patient.val().state,
                        patient_country: patient.val().country,
                        patient_zip: patient.val().zip.toString()
                    });
                }
            });
        } else {
            database().ref('patients/').once('value', function (patients) {
                let temp = [];

                patients.forEach(function (patient) {
                    temp.push({key: patient.key, label: patient.val().name});
                });

                setPatients(temp);
            });
        }

        setViewPatientModalVisible(!viewPatientModalVisible);
    }

    const PatientDataPage = () => {
        const COVIDWindow = () => {
            return(
                <View
                    style={styles.window}
                >
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.headingText}>COVID</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1,}}>
                            <Text style={styles.mediumText}>Test patients for COVID and view historical
                                data</Text>
                        </View>
                    </View>
                    <View style={styles.navButtonContainer}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('NewPatient')}
                        >
                            <View style={styles.navIcon}>
                                <IconF name='user-plus' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>Create Patient</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => {
                                toggleViewPatientModal(0)
                            }}
                        >
                            <View style={styles.navIcon}>
                                <IconF name='user' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>View Patients</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        const FibrinogenWindow = () => {
            return(
                <View
                    style={styles.window}
                >
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.headingText}>Fibrinogen</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1,}}>
                            <Text style={styles.mediumText}>Test patients for fibrinogen levels and view
                                historical data</Text>
                        </View>
                    </View>
                    <View style={styles.navButtonContainer}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('NewPatient')}
                        >
                            <View style={styles.navIcon}>
                                <IconF name='user-plus' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>Create Patient</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => {
                                toggleViewPatientModal(0)
                            }}
                        >
                            <View style={styles.navIcon}>
                                <IconF name='user' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>View Patients</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (currentPage == 1) {
            if(currentSubpage == 0)
                return (
                    <ScrollView style={styles.page}>
                        <View style={styles.page}>
                            <COVIDWindow />
                        </View>
                    </ScrollView>
                );
            else if(currentSubpage == 1)
                return (
                    <ScrollView style={styles.page}>
                        <View style={styles.page}>
                            <FibrinogenWindow />
                        </View>
                    </ScrollView>
                );
        } else
            return <View/>
    }

    /*

        DEVICE PAGE

     */

    const DevicePage = () => {
        const DeviceWindow = () => {
            return(
                <View
                    style={styles.window}
                >
                    <View style={{marginLeft: 20, marginRight: 20}}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.headingText}>Devices</Text>
                        </View>
                        <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                            <View style={{flex: 1,}}>
                                <Text style={styles.mediumText}>Tap a device to connect</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        if (currentPage == 2)
            return (
                <ScrollView style={styles.page}>
                    <View style={styles.page}>
                        <DeviceWindow />
                    </View>
                </ScrollView>
            );
        else
            return <View/>;
    }

    /*

        COVID/FIBRINOGEN TEST PAGE

     */

    const TestPage = () => {
        // for test results page
        const [testType, setTestType] = useState('');
        const [testResult, setTestResult] = useState('');

        const TestTypeWindow = () => {
            return(
                <View style={styles.window}>
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.headingText}>Test Type</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 1,}}>
                            <Text style={styles.mediumText}>Change between test types. This will happen
                                automatically if a sensor is inserted. </Text>
                        </View>
                    </View>
                    <View style={styles.navButtonContainer}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => {
                                setTestType('Fibrinogen');
                            }}
                        >
                            <View style={styles.navIcon}>
                                <IconMCI name='water' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>Fibrinogen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => {
                                setTestType('COVID');
                            }}
                        >
                            <View style={styles.navIcon}>
                                <IconMCI name='water' size={30} color='#fff'/>
                            </View>
                            <Text style={styles.navButtonText}>COVID</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        const TestWindow = () => {
            const add_test_result = () => {
                if (testType == 'COVID') {
                    const testReference = database().ref('/tests/covid').push();
                    const date = new Date();
                    testReference
                        .set({
                            name: 'fakename',
                            result: testResult,
                            time: date.toISOString()
                        })
                        .then(() => console.log('Added entry for /tests/covid/' + testReference.key));
                } else if (testType == 'Fibrinogen') {
                    const testReference = database().ref('/tests/fibrinogen').push();
                    const date = new Date();
                    testReference
                        .set({
                            name: 'fakename',
                            result: testResult,
                            time: date.toISOString()
                        })
                        .then(() => console.log('Added entry for /tests/fibrinogen/' + testReference.key));
                }

                Alert.alert('Success', 'Added test result to database');
            }

            if(testType == 'COVID')
                return(
                    <View style={styles.window}>
                        <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                            <View style={{flex: 1}}>
                                <Text style={styles.headingText}>COVID Test</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                marginLeft: 35,
                                marginRight: 35,
                                marginTop: 40,
                                borderColor: '#eee',
                                borderWidth: 1,
                                borderRadius: 5
                            }}
                        >
                            <TextInput
                                underlineColorAndroid='transparent'
                                placeholder='Enter result'
                                placeholderTextColor='#bbb'
                                keyboardType='numeric'
                                onChangeText={(testResult) => setTestResult(testResult)}
                                numberOfLines={1}
                                multiline={false}
                                style={{padding: 25}}
                                blurOnSubmit={false}
                            />
                        </View>
                        <View style={styles.testButtonContainer}>
                            <TouchableOpacity
                                onPress={add_test_result}
                                style={styles.testButton}
                            >
                                <Text style={styles.testButtonText}>Log Test Result</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            else if(testType == 'Fibrinogen')
                return(
                    <View style={styles.window}>
                        <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                            <View style={{flex: 1}}>
                                <Text style={styles.headingText}>Fibrinogen Test</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                marginLeft: 35,
                                marginRight: 35,
                                marginTop: 40,
                                borderColor: '#eee',
                                borderWidth: 1,
                                borderRadius: 5
                            }}
                        >
                            <TextInput
                                underlineColorAndroid='transparent'
                                placeholder='Enter result'
                                placeholderTextColor='#bbb'
                                keyboardType='numeric'
                                onChangeText={(testResult) => setTestResult(testResult)}
                                numberOfLines={1}
                                multiline={false}
                                style={{padding: 25}}
                                blurOnSubmit={false}
                            />
                        </View>
                        <View style={styles.testButtonContainer}>
                            <TouchableOpacity
                                onPress={add_test_result}
                                style={styles.testButton}
                            >
                                <Text style={styles.testButtonText}>Log Test Result</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            else
                return <View />;
        }

        if (currentPage == 3)
            return (
                <ScrollView style={styles.page}>
                    <View style={styles.page}>
                        <TestTypeWindow />
                        <TestWindow />
                    </View>
                </ScrollView>
            );
        else
            return <View/>;
    }

    /*

        HOME PAGE

     */

    return (
        <SafeAreaView style={{
            backgroundColor: '#333',
            flex: 1,
            marginTop: -35
            }}>
            <ModalSelector
                data={patients}
                visible={viewPatientModalVisible}
                onCancel={() => {
                    toggleViewPatientModal(0);
                }}
                customSelector={<View />}
                onChange={(option) => {
                    toggleViewPatientModal(option.key);
                }}
                optionContainerStyle={{backgroundColor: '#111', border: 0}}
                optionTextStyle={{color: '#444', fontSize: 18, fontWeight: 'bold'}}
                optionStyle={{
                    padding: 20,
                    backgroundColor: '#eee',
                    borderRadius: 100,
                    margin: 5,
                    marginBottom: 15,
                    borderColor: '#222'
                }}
                cancelText={'Cancel'}
                cancelStyle={styles.cancelButton}
                cancelTextStyle={styles.testButtonText}
                searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                listType={'FLATLIST'}
            />
            <AccountPage />
            <PatientDataPage />
            <DevicePage />
            <TestPage />
            <NavBar />
            <SubNavBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        padding: 20,
    },
    section: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    window: {
        flex: 1,
        margin: 10,
        marginTop: 0,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 15
    },
    headingText: {
        padding: 5,
        fontSize: 32,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        flex: 1
    },
    mediumText: {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 25,
        paddingBottom: 25,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center'
    },
    buttonText: {
        fontSize: 22,
        color: '#eee',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    button: {
        backgroundColor: '#444',
        borderWidth: 1,
        borderColor: '#777',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 50,
        marginTop: 10,
        marginBottom: 10,
    },
    subNavBarContainer: {
        justifyContent: 'space-around',
        alignContent: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#333'
    },
    topNavBarButton: {
        margin: 0,
        textAlign: 'center',
        alignItems: 'center',
        padding: 14,
    },
    topNavBarButtonSelected: {
        textAlign: 'center',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#333'
    },
    topNavBarIcon: {
        borderRadius: 5000,
        paddingBottom: 4,
    },
    topNavButtonContainer: {
        justifyContent: 'space-between',
        alignContent: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#555',
        backgroundColor: '#222'
    },
    navButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1,
    },
    navButton: {
        margin: 15,
        flex: 0.5,
        textAlign: 'center',
        alignItems: 'center',
    },
    navIcon: {
        backgroundColor: '#333',
        padding: 20,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 5000,
        marginBottom: 10
    },
    navIconSelected: {
        backgroundColor: '#555',
        padding: 20,
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5000,
        marginBottom: 10
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'center',
    },
    testButton: {
        backgroundColor: '#2cab5c',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 20,
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
    },
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    cancelButton: {
        backgroundColor: 'rgb(222,167,91)',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center',
        alignItems: 'center'
    },
    cancelButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});