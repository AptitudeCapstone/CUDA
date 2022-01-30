import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import Icon from 'react-native-vector-icons/AntDesign';
import {useIsFocused} from '@react-navigation/native';
import {parseISO} from 'date-fns';
import ModalSelector from "react-native-modal-selector-searchable";
import database from "@react-native-firebase/database";
import {buttons, fonts, format} from '../../style/style';
import IconE from 'react-native-vector-icons/Entypo';


export const Patient = ({route, navigation}) => {

    const [selectedTest, setSelectedTest] = useState('COVID');
    const [patientKey, setPatientId] = useState(null);

    /*

        COVID/FIBRINOGEN SELECTION BAR

     */

    const TestSelectBar = () => {
        return (
            <View style={format.testSelectBar}>
                <TouchableOpacity
                    style={(selectedTest == 'COVID') ? buttons.covidSelectButton : buttons.unselectedButton}
                    onPress={() => setSelectedTest('COVID')}
                >
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(selectedTest == 'Fibrinogen') ? buttons.fibrinogenSelectButton : buttons.unselectedButton}
                    onPress={() => setSelectedTest('Fibrinogen')}
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
        const [patients, setPatients] = useState([]);
        const [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);

        const toggleViewPatientModal = (patientKey) => {
            // if we are re-showing this modal, update patient list in case it has changed
            if(!viewPatientModalVisible) {
                // if signed in to org, display all patients in org
                // traverse all
            }

            if (patientKey != null) {
                /*
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

                database().ref('patients/').once('value', function (patients) {
                    let temp = [];

                    patients.forEach(function (patient) {
                        temp.push({key: patient.key, label: patient.val().name});
                    });

                    setPatients(temp);
                });
                 */
            }

            setViewPatientModalVisible(!viewPatientModalVisible);
        }

        const PatientSelectorButton = () => {
            return (
                <View style={format.selectPatientBarContainer}>
                    <TouchableOpacity
                        style={format.selectPatientBar}
                        onPress={() => toggleViewPatientModal(null)}
                    >
                        <Text style={fonts.patientSelectText}>Select a patient</Text>
                        <IconE
                            name='chevron-down' size={26} style={{color: '#eee', paddingLeft: 10}}/>
                    </TouchableOpacity>
                </View>
            );
        }

        return(
            <ModalSelector
                data={patients}
                visible={viewPatientModalVisible}
                onCancel={() => {
                    toggleViewPatientModal(null);
                }}
                customSelector={<PatientSelectorButton/>}
                onChange={(option) => {
                    toggleViewPatientModal(option.key);
                }}
                optionContainerStyle={{
                    backgroundColor: '#111', border: 0
                }}
                optionTextStyle={{
                    color: '#444', fontSize: 18, fontWeight: 'bold'
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
                cancelStyle={styles.cancelButton}
                cancelTextStyle={styles.testButtonText}
                searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                listType={'FLATLIST'}
            />
        );
    }

    /*

        PATIENT PORTAL FOR COVID AND FIBRINOGEN

     */

    const PatientPortal = () => {
        const [patientQrId, setPatientQrId] = useState(null);
        const [patientName, setPatientName] = useState(null);
        const [patientEmail, setPatientEmail] = useState(null);
        const [patientPhone, setPatientPhone] = useState(null);
        const [patientStreetAddress1, setPatientStreetAddress1] = useState(null);
        const [patientStreetAddress2, setPatientStreetAddress2] = useState(null);
        const [patientCity, setPatientCity] = useState(null);
        const [patientState, setPatientState] = useState(null);
        const [patientCountry, setPatientCountry] = useState(null);
        const [patientZip, setPatientZip] = useState(null);

        const [covidTests, setCovidTests] = useState(0);
        const [fibTests, setFibTests] = useState(0);

        const [lastCovidLength, setLastCovidLength] = useState(0);
        const [lastFibLength, setLastFibLength] = useState(0);
        const [lastCovidUnits, setLastCovidUnits] = useState('days');
        const [lastFibUnits, setLastFibUnits] = useState('days');

        const timeBetweenDates = (date2) => {
            const currentDate = new Date();
            let date = currentDate.getTime() - date2.getTime();
            return {
                years: Math.floor(date / (1000 * 60 * 60 * 24 * 365)),
                months: Math.floor(date / (1000 * 60 * 60 * 24 * 30)),
                weeks: Math.floor(date / (1000 * 60 * 60 * 24 * 7)),
                days: Math.floor(date / (1000 * 60 * 60 * 24)),
                hours: Math.floor(date / (1000 * 60 * 60)),
                minutes: Math.floor(date / (1000 * 60)),
                seconds: Math.floor(date / (1000)),
            }
        }

        if(patientKey != null) {
            // patient has been selected
            if(selectedTest == 'COVID')
            return (
                <View>
                    <View style={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={{textAlign: 'right'}}>
                                <Icon
                                    onPress={() => {
                                        navigation.navigate('EditPatient', {
                                            navigation,
                                            patientKey,
                                            patient_qr_id: patientQrId,
                                            patient_name: patientName,
                                            patient_phone: patientPhone,
                                            patient_email: patientEmail,
                                            patient_street_address_1: patientStreetAddress1,
                                            patient_street_address_2: patientStreetAddress2,
                                            patient_city: patientCity,
                                            patient_state: patientState,
                                            patient_country: patientCountry,
                                            patient_zip: patientZip
                                        })
                                    }}
                                    name='edit'
                                    size={36}
                                    color='#fff'
                                />
                            </Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <View style={{flex: 0.5, paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Contact</Text>
                            <Text style={styles.text}>{patientEmail}</Text>
                            <Text style={styles.text}>{patientPhone}</Text>
                        </View>
                        <View style={{flex: 0.5, paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Address</Text>
                            <Text style={styles.text}>{patientStreetAddress1}</Text>
                            <Text style={styles.text}>{patientStreetAddress2}</Text>
                            <Text
                                style={styles.text}>{patientCity + ', ' + patientState + ', ' + patientCountry + ', ' + patientZip}</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={{flexDirection: 'row', flex: 1}}
                        >
                            <View style={{alignItems: 'center', justifyContent: 'center', flex: 0.6, padding: 20}}>
                                <Text style={styles.headingText}>COVID Tests</Text>
                                <Text style={{
                                    color: '#fff',
                                    paddingTop: 6,
                                    fontSize: 18,
                                    textAlign: 'center'
                                }}>{(covidTests.length > 0) ? 'Last test was ' + lastCovidLength + ' ' + lastCovidUnits + ' ago' : 'No test results have been recorded yet'}</Text>
                            </View>
                            <View style={{padding: 10, alignItems: 'center', justifyContent: 'center', flex: 0.3}}>
                                <View
                                    style={{
                                        backgroundColor: '#333',
                                        padding: 20,
                                        borderWidth: 1,
                                        borderColor: '#555',
                                        borderRadius: 1000,
                                        width: 100,
                                        height: 100,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{
                                        color: '#eee',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: 30
                                    }}>{covidTests.length}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
            else return (
                <View>
                    <View style={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={{textAlign: 'right'}}>
                                <Icon
                                    onPress={() => {
                                        navigation.navigate('EditPatient', {
                                            navigation,
                                            patientKey,
                                            patient_qr_id: patientQrId,
                                            patient_name: patientName,
                                            patient_phone: patientPhone,
                                            patient_email: patientEmail,
                                            patient_street_address_1: patientStreetAddress1,
                                            patient_street_address_2: patientStreetAddress2,
                                            patient_city: patientCity,
                                            patient_state: patientState,
                                            patient_country: patientCountry,
                                            patient_zip: patientZip
                                        })
                                    }}
                                    name='edit'
                                    size={36}
                                    color='#fff'
                                />
                            </Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <View style={{flex: 0.5, paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Contact</Text>
                            <Text style={styles.text}>{patientEmail}</Text>
                            <Text style={styles.text}>{patientPhone}</Text>
                        </View>
                        <View style={{flex: 0.5, paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Address</Text>
                            <Text style={styles.text}>{patientStreetAddress1}</Text>
                            <Text style={styles.text}>{patientStreetAddress2}</Text>
                            <Text
                                style={styles.text}>{patientCity + ', ' + patientState + ', ' + patientCountry + ', ' + patientZip}</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={{flexDirection: 'row', flex: 1}}
                        >
                            <View style={{alignItems: 'center', justifyContent: 'center', flex: 0.6, padding: 20}}>
                                <Text style={styles.headingText}>Fibrinogen Tests</Text>
                                <Text style={{
                                    color: '#fff',
                                    paddingTop: 6,
                                    fontSize: 18,
                                    textAlign: 'center'
                                }}>{(fibTests.length > 0) ? 'Last test was ' + lastFibLength + ' ' + lastFibUnits + ' ago' : 'No test results have been recorded yet'}</Text>
                            </View>
                            <View style={{alignItems: 'center', justifyContent: 'center', flex: 0.3}}>
                                <View
                                    style={{
                                        backgroundColor: '#333',
                                        padding: 20,
                                        borderWidth: 1,
                                        borderColor: '#555',
                                        borderRadius: 1000,
                                        width: 100,
                                        height: 100,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{
                                        color: '#eee',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: 30
                                    }}>{fibTests.length}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else // patient has not yet been selected
            return (
                <View style={{padding: 25, paddingTop: 150, paddingBottom: 50}}>
                    <Text style={fonts.heading}>To view a patient portal, select the test type and the patient or scan their QR code</Text>
                </View>
            );
    }

    return (
        <SafeAreaView style={format.page}>
            <TestSelectBar/>
            <PatientSelector />
            <PatientPortal/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-around'
    },
    section: {
        flexDirection: 'row',
    },
    nameContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flex: 1,
        flexDirection: 'row'
    },
    nameText: {
        fontSize: 36,
        color: '#fff',
        textAlign: 'left',
        fontWeight: 'bold',
        flex: 1
    },
    sectionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'left',
        paddingTop: 4,
        paddingBottom: 4,
    },
    text: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'left',
        paddingTop: 4,
        paddingBottom: 4,
    },
    infoText: {
        fontSize: 18,
        color: '#fff',
    },
    headingContainer: {
        backgroundColor: '#ccc',
        textAlign: 'left',
    },
    headingText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    infoContainer: {
        margin: 10,
    },
    subheadingText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'left',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
    },
});