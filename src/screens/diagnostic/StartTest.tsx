import React, {useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import IconE from 'react-native-vector-icons/Entypo';
import ModalSelector from "react-native-modal-selector-searchable";


export const StartTest = ({navigation, route}) => {
    const [value, setValue] = useState(null);

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
            if (!viewPatientModalVisible) {
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
                    <TouchableOpacity
                        style={format.selectPatientBarContainer}
                        onPress={() => toggleViewPatientModal(null)}
                    >
                        <Text style={fonts.username}>Select Patient</Text>
                        <IconE style={fonts.username}
                            name='chevron-down' size={34}/>
                    </TouchableOpacity>
            );
        }

        return (
            <ModalSelector
                data={patients}
                visible={viewPatientModalVisible}
                onCancel={() => {
                    toggleViewPatientModal(null);
                }}
                customSelector={<PatientSelectorButton />}
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
                searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                listType={'FLATLIST'}
            />
        );
    }

    /*

        LOG A TEST RESULT

     */

    const log_result = () => {

    }

    return (
        <SafeAreaView style={format.page}>
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
                    <Text style={fonts.subheading}>Result Value</Text>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Value'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(value) => setValue(value)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 20, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
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