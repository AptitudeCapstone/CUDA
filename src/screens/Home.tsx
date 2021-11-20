import React, {useEffect, useReducer, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import Icon from 'react-native-vector-icons/AntDesign';
import {BleManager, Device} from "react-native-ble-plx";
import {DeviceCard} from "../components/DeviceCard";
import {Base64} from '../lib/base64';

const manager = new BleManager();

// Reducer to add only the devices which have not been added yet
// When the bleManager search for devices, each time it detect a ble device, it returns the ble device even if this one has already been returned
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
    if (!value) {
        return '';
    }
    return Base64.decode(value).charCodeAt(0);
};

export const Home = ({navigation}) => {
    // reducer to store discovered ble devices
    const [scannedDevices, dispatch] = useReducer(reducer, []);
    const [isScanning, setIsScanning] = useState(false);

    const scanDevices = () => {
        // toggle activity indicator on
        setIsScanning(true);

        // scan devices
        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.warn(error);
            }

            // scan for devices with name 'raspberrypi'
            if (scannedDevice.name == 'raspberrypi') {
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
                                if (connectionError) {
                                    console.log(connectionError);
                                }
                                console.log('Device is disconnected');
                                console.log(connectionData);
                                console.log('Restarting BLE device scan');
                                setIsScanning(true);
                                scanDevices();
                            },
                        );
                        // discover all services and characteristics
                        return scannedDevice.discoverAllServicesAndCharacteristics();
                    })
                    .then(async (deviceObject) => {
                        console.log('deviceObject');
                        console.log(deviceObject);
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
                                console.log(characteristic.uuid, decodeBleString(characteristic.value));
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

    const ListHeaderComponent = () => (
        <View style={styles.body}>
            <View style={styles.sectionContainer}>
                {/*<Button
                    title="Clear devices"
                    onPress={() => dispatch({type: 'CLEAR'})}
                />*/}
            </View>
        </View>
    );

    useEffect(() => {
        return () => {
            manager.destroy();
        };
    }, []);

    useEffect(() => {
        scanDevices();
    }, [])

    return (
        <SafeAreaView style={styles.page}>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>CUDA Devices</Text>
                    {isScanning ? (
                        <Text style={{textAlign: 'right'}}>
                            <ActivityIndicator color={'white'} size={25}/>
                        </Text>
                    ) : (
                        <Text style={{textAlign: 'right'}}>
                            <Icon onPress={scanDevices} name='plus' size={24} color='#fff'/>
                        </Text>
                    )}
                </View>
                <FlatList
                    keyExtractor={(item) => item.id}
                    data={scannedDevices}
                    renderItem={({item}) => <DeviceCard device={item} navigation={navigation}/>}
                    ListHeaderComponent={ListHeaderComponent}
                    contentContainerStyle={styles.content}
                />
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Patients</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('NewPatient', {device: Device})} name='plus' size={24}
                              color='#fff'/>
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Patients')}
                >
                    <Text style={styles.navButtonText}>View patients</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('QRCodes')}
                >
                    <Text style={styles.navButtonText}>QR codes</Text>
                </TouchableOpacity>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Test Results</Text>
                </View>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('AllResults')}
                >
                    <Text style={styles.navButtonText}>View by patient</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('AllResults')}
                >
                    <Text style={styles.navButtonText}>View recent tests</Text>
                </TouchableOpacity>
            </View>
            <View styles={styles.section}>
                <View style={styles.testButtonContainer}>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => navigation.navigate('Diagnostic')}
                    >
                        <Text style={styles.testButtonText}>Begin a Test</Text>
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
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row',
    },
    headingContainer: {
        backgroundColor: '#333',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
        fontWeight: 'bold'
    },
    subheadingContainer: {
        paddingTop: 10,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    subheadingText: {
        fontSize: 14,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
        textAlign: 'center',
    },
    navButton: {
        backgroundColor: '#444',
        padding: 20,
        alignSelf: 'stretch',
        borderBottomWidth: 2,
        borderBottomColor: '#666',
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#3cba3c',
        padding: 40,
        alignSelf: 'stretch'
    },
    testButtonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});