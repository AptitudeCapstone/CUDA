import React, {useEffect, useReducer, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import IconAD from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/Feather';
import IconMCA from 'react-native-vector-icons/MaterialCommunityIcons';
import {BleManager, Device} from "react-native-ble-plx";
import {DeviceCard} from "../components/DeviceCard";
import {openDatabase} from 'react-native-sqlite-storage';
import {Base64} from '../lib/base64';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import ModalSelector from 'react-native-modal-selector-searchable';

const manager = new BleManager();

var db = openDatabase({name: 'PatientDatabase.db'}, () => {}, error => {console.log('ERROR: ' + error)});

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

export const Home = ({navigation}) => {
    // reducer to store discovered ble devices
    const [scannedDevices, dispatch] = useReducer(reducer, []);
    const [isScanning, setIsScanning] = useState(false);
    const [patientSelection, setPatientSelection] = useState(0);
    const [patientID, setPatientID] = useState(0);
    const [patients, setPatients] = useState([]);
    const [listModalVisible, setListListModalVisible] = useState(false);
    const [camModalVisible, setCamModalVisible] = useState(false);

    const scanDevices = () => {
        // toggle activity indicator on
        setIsScanning(true);

        // scan devices
        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error)
                console.warn(error);

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

    useEffect(() => {
        // start to scan when page is open
        scanDevices();

        // if this is the first run of the app, create the database tables
        db.transaction(function (tx) {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS table_patients(patient_id INTEGER PRIMARY KEY AUTOINCREMENT, patient_name VARCHAR(30), patient_contact INT(15), patient_address VARCHAR(255))',
                []
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS table_tests(test_id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, test_type INT(8), test_result VARCHAR(255), test_time VARCHAR(255))',
                []
            );
        });

        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_patients',
                [],
                (tx, results) => {
                    let temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push({
                            key: results.rows.item(i).patient_id,
                            label: results.rows.item(i).patient_name.toString()
                        });
                    setPatients(temp);
                }
            );
        });

        // destroy manager when done
        return () => {
            manager.destroy();
        };
    }, []);

    // set patient ID via QR code
    let setPatientByQR = e => {
        if (e.data == null) {
            Alert.alert('No QR code found.');
        } else {
            // check if patient exists in database
            setPatientID(e.data);

        }

        setCamModalVisible(false);
    }

    // for test section to select method of patient selection
    const patient_selection_change = (selection) => {
        switch (selection) {
            case 1: // if select from list
                db.transaction((tx) => {
                    tx.executeSql(
                        'SELECT * FROM table_patients',
                        [],
                        (tx, results) => {
                            let temp = [];
                            for (let i = 0; i < results.rows.length; ++i)
                                temp.push({
                                    key: results.rows.item(i).patient_id,
                                    label: results.rows.item(i).patient_name.toString()
                                });
                            setPatients(temp);
                        }
                    );
                });
                // populate patients list
                setListListModalVisible(true);
                break;
            case 2: // if select by scanning qr clear patient ID
                setPatientID(0);
                break;
            case 3: // if no select
                break;
            default: // if none selected
                break;
        }

        setPatientSelection(selection);
    }

    const hideListModal = () => {
        if (listModalVisible) setListListModalVisible(false);
    }

    const hideCamModal = () => {
        if (camModalVisible) setCamModalVisible(false);
    }

    // for test section to start test
    const start_test = () => {
        navigation.navigate('Diagnostic', {navigation, patientID: patientID});
    }

    return (
        <SafeAreaView
            style={{
                backgroundColor: '#222', flex: 1,
                flexDirection: 'column'
            }}
        >
            <ScrollView>
                <View style={styles.page}>
                    <View style={styles.section}>
                        <View style={styles.headingContainer}>
                            <Text style={styles.headingText}>Patients</Text>
                        </View>
                        <View style={styles.navButtonContainer}>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={() => navigation.navigate('NewPatient', {device: Device})}
                            >
                                <View style={styles.navIcon}>
                                    <IconF name='user-plus' size={30} color='#fff'/>
                                </View>
                                <Text style={styles.navButtonText}>Create Patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={() => navigation.navigate('Patients')}
                            >
                                <View style={styles.navIcon}>
                                    <IconF name='user' size={30} color='#fff'/>
                                </View>
                                <Text style={styles.navButtonText}>View Patients</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={() => navigation.navigate('QRCodes')}
                            >
                                <View style={styles.navIcon}>
                                    <IconMCA name='qrcode' size={30} color='#fff'/>
                                </View>
                                <Text style={styles.navButtonText}>Create QR Codes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.testSection}>
                        <View style={styles.testButtonContainer}>
                            <View style={styles.headingContainer}>
                                <Text style={styles.headingText}>Start a Test</Text>
                                {isScanning ? (
                                    <Text style={{marginLeft: -28, textAlign: 'right'}}>
                                        <ActivityIndicator color={'white'} size={28}/>
                                    </Text>
                                ) : (
                                    <View></View>
                                )}
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
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => {
                                        patient_selection_change(1);
                                    }}
                                >
                                    <View style={(patientSelection == 1 ? styles.navIconSelected : styles.navIcon)}>
                                        <IconF name='user' size={30} color='#fff'/>
                                    </View>
                                    <Text style={styles.navButtonText}>Using Name or ID</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => {
                                        patient_selection_change(2);
                                        setCamModalVisible(true);
                                    }}
                                >
                                    <View style={(patientSelection == 2 ? styles.navIconSelected : styles.navIcon)}>
                                        <IconMCA name='qrcode-scan' size={30} color='#fff'/>
                                    </View>
                                    <Text style={styles.navButtonText}>Using a QR Code</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => {
                                        patient_selection_change(3);
                                    }}
                                >
                                    <View style={(patientSelection == 3 ? styles.navIconSelected : styles.navIcon)}>
                                        <IconF name='user-x' size={30} color='#fff'/>
                                    </View>
                                    <Text style={styles.navButtonText}>As a Guest</Text>
                                </TouchableOpacity>
                            </View>
                            {patientSelection == 0 ? (
                                <TouchableOpacity
                                    style={(patientSelection == 0 ? styles.testButtonGrayed : styles.testButton)}
                                >
                                    <Text style={styles.testButtonText}>Begin</Text>
                                    <Text style={{textAlign: 'right'}}>
                                        <IconAD name='arrowright' size={30} color='#fff'/>
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View></View>
                            )}
                            {(patientSelection == 1 && listModalVisible) ? (
                                <ModalSelector
                                    data={patients}
                                    visible={listModalVisible}
                                    onCancel={hideListModal}
                                    customSelector={<View></View>}
                                    onChange={(option) => {
                                        setPatientID(`${option.key}`);
                                        hideListModal();
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
                            ) : (
                                <View></View>
                            )}
                            {(patientSelection == 1 && patientID != 0) ? (
                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={start_test}
                                >
                                    <Text style={styles.testButtonText}>Begin</Text>
                                    <Text style={{textAlign: 'right'}}>
                                        <IconAD name='arrowright' size={30} color='#fff'/>
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View></View>
                            )}
                            {patientSelection == 2 ? (
                                <Modal
                                    transparent={true}
                                    visible={camModalVisible}
                                    onRequestClose={() => {
                                        setCamModalVisible(false);
                                    }}
                                >
                                    <View style={{backgroundColor: 'rgba(0, 0, 0, 0.9)', flex: 1}}>
                                        <QRCodeScanner
                                            topContent={<View style={{
                                                borderRadius: 100,
                                                marginBottom: 20,
                                                paddingTop: 25, paddingBottom: 25, paddingLeft: 40, paddingRight: 40,
                                            }}><Text style={{
                                                fontSize: 24,
                                                color: '#eee',
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>Place the QR code within the frame to continue</Text></View>}
                                            bottomContent={<TouchableOpacity
                                                style={styles.testButtonGrayed}
                                                onPress={hideCamModal}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>}
                                            containerStyle={{marginTop: 40}}
                                            onRead={setPatientByQR}
                                            flashMode={RNCamera.Constants.FlashMode.auto}
                                        />
                                    </View>
                                </Modal>
                            ) : (
                                <View></View>
                            )}
                            {((patientSelection == 1 || patientSelection == 2) && patientID == 0) ? (
                                <TouchableOpacity
                                    style={styles.testButtonGrayed}
                                >
                                    <Text style={styles.testButtonText}>Begin</Text>
                                    <Text style={{textAlign: 'right'}}>
                                        <IconAD name='arrowright' size={30} color='#fff'/>
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View></View>
                            )}
                            {patientSelection == 3 ? (
                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={start_test}
                                >
                                    <Text style={styles.testButtonText}>Begin</Text>
                                    <Text style={{textAlign: 'right'}}>
                                        <IconAD name='arrowright' size={30} color='#fff'/>
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View></View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        flex: 1,
        flexDirection: 'column'
    },
    section: {
        flexDirection: 'column',
        flex: 1
    },
    testSection: {
        flexDirection: 'column'
    },
    headingContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 24,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
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
    navButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    navButton: {
        margin: 15,
        flex: 0.3,
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
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#282828',
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
    testButtonGrayed: {
        backgroundColor: 'rgb(222,167,91)',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 20,
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
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        paddingRight: 24,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    cancelButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});