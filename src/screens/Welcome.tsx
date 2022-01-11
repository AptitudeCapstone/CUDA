import React, {useEffect, useReducer, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import logo from '../CUDA-logos_white.png';
import {BleManager, Device} from "react-native-ble-plx";
import {DeviceCard} from "../components/DeviceCard";
import {openDatabase} from 'react-native-sqlite-storage';
import {Base64} from '../lib/base64';
import IconF from 'react-native-vector-icons/Feather';
import IconI from 'react-native-vector-icons/Ionicons';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconA from 'react-native-vector-icons/AntDesign';
import IconFo from 'react-native-vector-icons/Foundation';
import {useIsFocused} from "@react-navigation/native";
import database from "@react-native-firebase/database";

const manager = new BleManager();

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

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
    // reducer to store covered ble devices
    const [scannedDevices, dispatch] = useReducer(reducer, []);
    const [isScanning, setIsScanning] = useState(false);

    const [connectedOrg, setConnectedOrg] = useState('');   // database key of the current organization
    const [connectedOrgName, setConnectedOrgName] = useState('');   // name of the current organization

    const [testPatientModalVisible, setTestPatientModalVisible] = useState(false);
    const [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);

    const [currentPage, setCurrentPage] = useState(2);
    const [testType, setTestType] = useState('Fibrinogen');

    // this is run once each time screen is opened
    const isFocused = useIsFocused();

    useEffect(() => {
        if (route.params) {
            const {currentOrgName} = route.params;
            setConnectedOrgName(currentOrgName);
        }
    }, [isFocused]);

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

    const scanDevices = () => {
        // toggle activity indicator on
        setIsScanning(true);

        // scan devices
        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) console.warn(error);

            // scan for devices with name 'raspberrypi'
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

    useEffect(() => {
        // start to scan when page is open
        scanDevices();

        // destroy manager when done
        return () => {
            manager.destroy();
        };
    }, []);

    const toggleViewPatientModal = (id) => {
        if (viewPatientModalVisible) {
            database().ref('patients/' + id).once('value', function (patient) {
                //verify that org with add code exists
                if (patient.val()) {
                    navigation.navigate('Patient', {
                        navigation,
                        patient_id: id,
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
        }

        setViewPatientModalVisible(!viewPatientModalVisible);
    }

    return (
        <SafeAreaView style={styles.page}>
            <ScrollView>
                <View style={styles.page}>
                    {/*
                        this is where I could show the current organization and user info
                        for now, just displays the setup organization questions
                     */}
                    {(currentPage == 0) ?
                        (
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
                                <Text style={styles.mediumText}>While it is not required, creating a test administer
                                    account allows you to sync patient data with other apps and retain data if the app
                                    is deleted</Text>
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
                    ) : (<View></View>)}
                    {(currentPage == 0) ?
                        (
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
                                                syncs patient data with all other apps from the organization</Text>
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
                                    <Text style={styles.mediumText}>Data is being synced with {connectedOrgName}</Text>
                                    <View style={styles.navButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.navButton}
                                            onPress={disconnectFromOrg}
                                        >
                                            <View style={styles.navIcon}>
                                                <IconF name='user-minus' size={30} color='#fff'/>
                                            </View>
                                            <Text style={styles.navButtonText}>Disconnect from {connectedOrgName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>)
                        }
                    </View>
                        ) : (<View></View>)}
                    {(currentPage == 1) ?
                        (
                    <View><View
                        style={styles.window}
                    >
                        <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                            <View style={{flex: 1}}>
                                <Text style={styles.headingText}>COVID</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                            <View style={{flex: 1,}}>
                                <Text style={styles.mediumText}>Test patients for COVID and view historical data</Text>
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
                                <Text style={styles.mediumText}>Test patients for fibrinogen levels and view historical data</Text>
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
                        </View>) : (<View></View>)}
                    {(currentPage == 2) ?
                        (<View
                            style={styles.window}
                        >
                            <View style={{marginLeft: 20, marginRight: 20}}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.headingText}>Devices</Text>
                                    {isScanning ? (
                                        <Text style={{marginLeft: -28, marginTop: 20, textAlign: 'right'}}>
                                            <ActivityIndicator color={'white'} size={28}/>
                                        </Text>
                                    ) : (
                                        <View></View>
                                    )}
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                    <View style={{flex: 1,}}>
                                        <Text style={styles.mediumText}>Tap a device to connect</Text>
                                    </View>
                                </View>
                                {scannedDevices.length == 0 ? (
                                    <View style={styles.navButtonContainer}>
                                        <View style={styles.navButton}>
                                            <Text style={styles.navButtonText}>No devices found</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <FlatList
                                        horizontal={true}
                                        keyExtractor={(item) => item.id}
                                        data={scannedDevices}
                                        renderItem={({item}) => <DeviceCard device={item} navigation={navigation}/>}
                                        contentContainerStyle={styles.navButtonContainer}
                                    />
                                )}
                            </View>

                        </View>) : (<View></View>)}
                    {(currentPage == 3) ?
                        (
                            <View
                                style={styles.window}
                            >
                                <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.headingText}>Test Type</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                    <View style={{flex: 1,}}>
                                        <Text style={styles.mediumText}>Change between test types. This will happen automatically if a sensor is inserted. </Text>
                                    </View>
                                </View>
                                <View style={styles.navButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.navButton}
                                        onPress={() => {
                                            setCurrentPage(1);
                                            setTestType('COVID');
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
                                            setCurrentPage(1);
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
                        ) : (<View></View>)}
                </View>
            </ScrollView>
            <View style={{justifyContent: 'center', alignContent: 'center', textAlign: 'center', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#555', padding: 10, marginBottom: 5, paddingBottom: 5}}>
                {/*<Image
                    style={{
                        width: 130,
                        height: 130,


                    }}
                    source={logo}
                />*/}
                <View style={styles.topNavButtonContainer}>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentPage(0)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconF name='user' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentPage(1)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconFo name='graph-bar' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Patients</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentPage(2)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconMI name='device-hub' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Devices</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.topNavBarButton}
                        onPress={() => setCurrentPage(3)}
                    >
                        <View style={styles.topNavBarIcon}>
                            <IconMCI name='water' size={30} color='#fff'/>
                        </View>
                        <Text style={styles.navButtonText}>Test Type</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    numbering: {
        fontSize: 36,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
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
    navBarButtonContainer: {
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1
    },
    topNavBarButton: {
        margin: 0,
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
    },
    topNavBarIcon: {
        padding: 14,
        borderRadius: 5000,
        marginBottom: 10,
    },
    topNavButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1
    },
    navBarButton: {
        margin: 15,
        flex: 0.5,
        textAlign: 'center',
        alignItems: 'center',
    },
    navBarIcon: {
        backgroundColor: '#333',
        padding: 18,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 5000,
        marginBottom: 4,
    },
    navButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1
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
});