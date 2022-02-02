import React, {useState, useEffect} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import ModalSelector from "react-native-modal-selector-searchable";
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import {useIsFocused} from "@react-navigation/native";


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
                    if (selectedTest == 'COVID') {
                        if (orgInfo === null) {
                            patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID);
                        } else {
                            patient = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID);
                        }
                    } else if (selectedTest == 'Fibrinogen') {
                        if (orgInfo === null) {
                            patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen);
                        } else {
                            patient = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen);
                        }
                    }

                    // update data for patient for appropriate test type
                    patient.once('value', function (patientSnapshot) {
                        if(selectedTest == 'COVID') {
                            setPatientKeyCOVID(patientSnapshot.key);
                            setPatientDataCOVID(patientSnapshot.val());
                        } else if(selectedTest == 'Fibrinogen') {
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
                    style={(selectedTest == 'COVID') ? buttons.covidSelectButton : buttons.unselectedButton}
                    onPress={() => {
                        // change selected test and update the currently showing patient
                        setSelectedTest('COVID');
                    }}
                >
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(selectedTest == 'Fibrinogen') ? buttons.fibrinogenSelectButton : buttons.unselectedButton}
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

                if (selectedTest == 'COVID') {
                    if (orgInfo === null) {
                        patients = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/').orderByChild('name');
                    } else {
                        patients = database().ref('/organizations/' + userInfo.organization + '/patients/covid/').orderByChild('name')
                    }
                } else if (selectedTest == 'Fibrinogen') {
                    if (orgInfo === null) {
                        patients = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/').orderByChild('name');
                    } else {
                        patients = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/').orderByChild('name')
                    }
                }

                patients.once('value', function (snapshot) {
                    if (snapshot.val()) {
                        let patientList = [];
                        snapshot.forEach(function (data) {patientList.push({key: data.key, label: data.val().name});});
                        setPatients(patientList);
                    }
                });
            }

            setViewPatientModalVisible(!viewPatientModalVisible);
        }

        const PatientSelectorButton = () => {
            return(
                <View>
                    <TouchableOpacity
                        onPress={() => toggleViewPatientModal()}
                        style={format.selectPatientBarContainer}
                    >
                        <Text style={fonts.username}>
                            {
                                (selectedTest == 'COVID') ?
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
                        if(selectedTest == 'COVID')
                            setPatientKeyCOVID(option.key);
                        else if(selectedTest == 'Fibrinogen')
                            setPatientKeyFibrinogen(option.key);

                        // get patient info for appropriate test type
                        let patient = null;
                        if (selectedTest == 'COVID') {
                            if (orgInfo === null) {
                                patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + option.key);
                            } else {
                                patient = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + option.key);
                            }
                        } else if (selectedTest == 'Fibrinogen') {
                            if (orgInfo === null) {
                                patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + option.key);
                            } else {
                                patient = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + option.key);
                            }
                        }

                        // update data for patient for appropriate test type
                        await patient.once('value', function (patientSnapshot) {
                            if(selectedTest == 'COVID') {
                                setPatientKeyCOVID(patientSnapshot.key);
                                setPatientDataCOVID(patientSnapshot.val());
                            } else if(selectedTest == 'Fibrinogen') {
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
            if (selectedTest == 'COVID') {
                const testReference = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/').push();
                const date = new Date();
                testReference
                    .set({
                        result: value,
                        time: date.toISOString()
                    })
                    .then(() => console.log('Added entry for /users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
            } else if (selectedTest == 'Fibrinogen') {
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
            if (selectedTest == 'COVID') {
                const testReference = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/').push();
                const date = new Date();
                testReference
                    .set({
                        result: value,
                        time: date.toISOString()
                    })
                    .then(() => console.log('Added entry for /organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/' + testReference.key));
            } else if (selectedTest == 'Fibrinogen') {
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