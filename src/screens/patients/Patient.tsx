import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import ModalSelector from "react-native-modal-selector-searchable";
import {useIsFocused} from '@react-navigation/native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import {buttons, fonts, format} from '../../style/style';
import database from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";


export const Patient = ({route, navigation}) => {
    // get current user and org info
    // determines when page comes into focus
    const isFocused = useIsFocused(),
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
        const [patients, setPatients] = useState([]);
        const [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);

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
            const PatientUtilityBar = () => {
                if(selectedTest == 'COVID') {
                    if (patientDataCOVID !== null) {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create Patient COVID')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Export</Text>
                                    <IconF
                                        name='share' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Edit Patient COVID', {patientKey: patientKeyCOVID});
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Edit</Text>
                                    <IconA
                                        name='edit' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create Patient COVID')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                            </View>
                        )
                    } else {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create Patient COVID')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus'
                                        size={20}
                                        style={{color: '#eee', marginTop: 6}}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                } else if(selectedTest == 'Fibrinogen') {
                    if (patientDataFibrinogen !== null) {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create Patient Fibrinogen')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Export</Text>
                                    <IconF
                                        name='share' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Edit Patient Fibrinogen', {patientKey: patientKeyFibrinogen});
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Edit</Text>
                                    <IconA
                                        name='edit' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create Patient Fibrinogen')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                            </View>
                        )
                    } else {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create Patient Fibrinogen')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus'
                                        size={20}
                                        style={{color: '#eee', marginTop: 6}}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                }
            }

            return(
                <View>
                        <TouchableOpacity
                            onPress={() => toggleViewPatientModal()}
                            style={format.selectPatientBarContainer}
                        >
                            <Text style={fonts.username}>{
                                ((selectedTest == 'COVID') ?
                                (patientDataCOVID === null) ? 'Select Patient' : patientDataCOVID.name
                                 :
                                (patientDataFibrinogen === null) ? 'Select Patient' : patientDataFibrinogen.name
                            )

                            }</Text>
                            <IconE style={fonts.username}
                                name={viewPatientModalVisible ? 'chevron-up' : 'chevron-down'} size={34}
                            />
                        </TouchableOpacity>
                    <PatientUtilityBar />
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
                    cancelStyle={styles.cancelButton}
                    cancelTextStyle={styles.testButtonText}
                    searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                    searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                    listType={'FLATLIST'}
                />
                <PatientSelectorButton/>
            </View>
        );
    }

    /*

        PATIENT PORTAL FOR COVID AND FIBRINOGEN

     */

    const PatientPortal = () => {
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


            // patient has been selected
            if (patientKeyCOVID != null && patientDataCOVID != null && selectedTest == 'COVID')
                return (
                    <View>
                        <View>
                            <View style={{paddingLeft: 20, paddingRight: 20}}>
                                <Text style={styles.sectionText}>Contact</Text>
                                <Text style={styles.text}>{(patientDataCOVID.email === undefined) ? '' : patientDataCOVID.email}</Text>
                                <Text style={styles.text}>{(patientDataCOVID.phone === undefined) ? '' : patientDataCOVID.phone}</Text>
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
            else if(patientKeyFibrinogen != null && patientDataFibrinogen != null && selectedTest == 'Fibrinogen') return (
                <View>
                    <View>
                        <View style={{paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Blood Type</Text>
                            {(patientDataCOVID.bloodType === undefined) ?
                                <Text style={styles.text}>Blood type has not been set</Text>
                                :
                                <Text style={styles.text}>{patientDataCOVID.bloodType}</Text>
                            }
                        </View>
                        <View style={{paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Age</Text>
                            {(patientDataCOVID.age === undefined) ?
                                <Text style={styles.text}>Age has not been set</Text>
                                :
                                <Text style={styles.text}>{patientDataCOVID.age}</Text>
                            }
                        </View>
                        <View style={{paddingLeft: 20, paddingRight: 20}}>
                            <Text style={styles.sectionText}>Age</Text>
                            {(patientDataCOVID.age === undefined) ?
                                <View />
                                :
                                <Text style={styles.text}>{patientDataCOVID.age}</Text>
                            }
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
                else // patient has not yet been selected
                    return (
                        <View style={{padding: 25, paddingTop: 150, paddingBottom: 50}}>
                            <Text style={fonts.heading}>To view a patient portal, select the test type and the patient or scan
                                their QR code</Text>
                        </View>
                    );
    }

    return (
        <SafeAreaView style={format.page}>
            <TestSelectBar/>
            <PatientSelector/>
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