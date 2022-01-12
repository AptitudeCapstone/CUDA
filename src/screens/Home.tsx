import React, {useEffect, useState} from 'react';
import {Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import IconAD from 'react-native-vector-icons/AntDesign';
import IconF from 'react-native-vector-icons/Feather';
import IconMCA from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import ModalSelector from 'react-native-modal-selector-searchable';
import database from "@react-native-firebase/database";

export const Home = ({navigation}) => {
    const [patientSelection, setPatientSelection] = useState(0);
    const [testPatientID, setTestPatientID] = useState(0);
    const [patients, setPatients] = useState([]);
    const [testPatientModalVisible, setTestPatientModalVisible] = useState(false);
    const [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);
    const [camModalVisible, setCamModalVisible] = useState(false);

    useEffect(() => {
        database().ref('/patients/').once('value', function (snapshot) {

            let temp = [];
            if (snapshot.val()) {
                snapshot.forEach(function (data) {
                    temp.push({key: data.key, label: data.val().name});
                });

                setPatients(temp);
            }
        })
    },);

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

    // for test section to select method of patient selection
    const patient_selection_change = (selection) => {
        switch (selection) {
            case 1: // if select from list
                setTestPatientID(0);
                break;
            case 2: // if select by scanning qr clear patient ID
                setTestPatientID(0);
                toggleCamModal();
                break;
            default: // if none selected
                break;
        }

        setPatientSelection(selection);
    }

    const toggleTestPatientModal = (id) => {
        if (testPatientModalVisible && id >= 0) {
            setTestPatientID(id);
        }

        setTestPatientModalVisible(!testPatientModalVisible);
    }

    // set patient ID via QR code
    let setPatientByQR = e => {
        if (e.data == null) {
            alert('No QR code found');
        } else {
            // check if patient exists in database
            if (e.data >= 0)
                setTestPatientID(e.data);

            toggleCamModal();
            setCamModalVisible(false);
        }
    }

    const toggleCamModal = () => {
        setCamModalVisible(!camModalVisible);
    }

    const start_test = () => {
        navigation.navigate('Diagnostic', {navigation, patientID: testPatientID});
    }

    return (
        <SafeAreaView
            style={{
                backgroundColor: '#222',
                flex: 1,
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
                            <View style={styles.navButtonContainer}>
                                <TouchableOpacity
                                    style={styles.navButton}
                                    onPress={() => {
                                        patient_selection_change(1);
                                        toggleTestPatientModal(-1);
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
                            {(patientSelection == 1) ? (
                                <ModalSelector
                                    data={patients}
                                    visible={testPatientModalVisible}
                                    onCancel={() => toggleTestPatientModal(-1)}
                                    customSelector={<View></View>}
                                    onChange={(option) => {
                                        toggleTestPatientModal(option.key);
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
                            {((patientSelection == 1 || patientSelection == 2) && testPatientID != 0) ? (
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
                                            topContent={
                                                <View
                                                    style={{
                                                        borderRadius: 100,
                                                        marginBottom: 20,
                                                        paddingTop: 25,
                                                        paddingBottom: 25,
                                                        paddingLeft: 40,
                                                        paddingRight: 40,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 24,
                                                            color: '#eee',
                                                            textAlign: 'center',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >Place the QR code within the frame to continue</Text>
                                                </View>
                                            }
                                            bottomContent={
                                                <TouchableOpacity
                                                    style={styles.testButtonGrayed}
                                                    onPress={() => toggleCamModal()}
                                                >
                                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                            }
                                            containerStyle={{marginTop: 40}}
                                            onRead={setPatientByQR}
                                            flashMode={RNCamera.Constants.FlashMode.auto}
                                        />
                                    </View>
                                </Modal>
                            ) : (
                                <View></View>
                            )}
                            {((patientSelection == 1 || patientSelection == 2) && testPatientID == 0) ? (
                                <TouchableOpacity style={styles.testButtonGrayed}>
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