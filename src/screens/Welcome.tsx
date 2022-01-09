import React, {useEffect, useReducer, useState} from 'react';
import {Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator} from 'react-native';
import logo from '../CUDA-logos_white.png';
import {BleManager, Device} from "react-native-ble-plx";
import {DeviceCard} from "../components/DeviceCard";
import {openDatabase} from 'react-native-sqlite-storage';
import {Base64} from '../lib/base64';
import IconF from 'react-native-vector-icons/Feather';
import IconMCA from 'react-native-vector-icons/MaterialCommunityIcons';

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

export const Welcome = ({navigation}) => {
    // reducer to store discovered ble devices
    const [scannedDevices, dispatch] = useReducer(reducer, []);
    const [isScanning, setIsScanning] = useState(false);

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

    useEffect(() => {
        // if this is the first run of the app, create the database tables
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS table_patients(' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                'qrId INT(10), ' +
                'name VARCHAR(30), ' +
                'email VARCHAR(255), ' +
                'phone INT(15), ' +
                'street_address_1 VARCHAR(255), ' +
                'street_address_2 VARCHAR(255), ' +
                'city VARCHAR(255), ' +
                'state VARCHAR(18), ' +
                'country VARCHAR(30), ' +
                'zip INT(8))',
                [], (tx, results) => {
                }
            );
        });
        db.transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS table_tests(' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                'patient_id INTEGER, ' +
                'type INT(3), ' +
                'result VARCHAR(255), ' +
                'time VARCHAR(255))',
                [],
                (tx, results) => {
                }
            );
        });
    },);

        return (
            <SafeAreaView style={styles.page}>
                <View style={{justifyContent: 'center', alignContent: 'center', textAlign: 'center', flexDirection: 'row'}}>
                    <Image
                        style={{
                            width: 120,
                            height: 120,
                            marginBottom: -20,
                            marginTop: -20
                        }}
                        source={logo}
                    />
                </View>
                <ScrollView>
                    <View style={styles.page}>
                        {/*
                        this is where I could show the current organization and user info
                        for now, just displays the setup organization questions
                     */}
                        <View
                            style={styles.window}
                        >
                            <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.headingText}>Organization</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                <View style={{flex: 1,}}>
                                    <Text style={styles.mediumText}>Connecting this app to an organization will sync
                                        data with other apps from the organization</Text>
                                </View>
                            </View>
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity
                                    style={styles.navButton}
                                >
                                    <View style={styles.navIcon}>
                                        <IconF name='user-plus' size={30} color='#fff'/>
                                    </View>
                                    <Text style={styles.navButtonText}>Create a new organization</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.navButton}
                                >
                                    <View style={styles.navIcon}>
                                        <IconF name='user' size={30} color='#fff'/>
                                    </View>
                                    <Text style={styles.navButtonText}>Connect to an organization</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
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

                        </View>
                        <View
                            style={styles.window}
                        >
                            <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.headingText}>Patient Data</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
                                <View style={{flex: 1,}}>
                                    <Text style={styles.mediumText}>View historical patient data</Text>
                                </View>
                            </View>
                            <View style={styles.navButtonContainer}>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={() => navigation.navigate('NewPatient', {device: Device})}
                            >
                                <View style={styles.navIcon}>
                                    <IconF name='user-plus' size={30} color='#fff'/>
                                </View>
                                <Text style={styles.navButtonText}>COVID</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navButton}
                            >
                                <View style={styles.navIcon}>
                                    <IconF name='user' size={30} color='#fff'/>
                                </View>
                                <Text style={styles.navButtonText}>Fibrinogen</Text>
                            </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        padding: 20
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
        padding: 10,
        fontSize: 32,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        flex: 1
    },
    mediumText: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 25,
        paddingBottom: 25,
        fontSize: 22,
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
        padding: 16,
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