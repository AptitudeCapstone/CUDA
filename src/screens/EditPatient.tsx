import React, {useState} from 'react';
import {Keyboard, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import SubmitButton from '../components/SubmitButton';
import TextInputField from '../components/TextInputField';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const EditPatient = ({route, navigation}) => {

    let {patient_id, patient_name, patient_phone, patient_address} = route.params;

    let [patientName, setPatientName] = useState(patient_name);
    let [patientPhone, setPatientPhone] = useState(patient_phone);
    let [patientAddress, setPatientAddress] = useState(patient_address);

    let update_user = () => {
        console.log(patient_id, patientName, patientPhone, patientAddress);

        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set patient_name=?, patient_contact=? , patient_address=? where patient_id=?',
                [patientName, patientPhone, patientAddress, patient_id],
                (tx, results) => {
                    console.log(results);
                    if (results.rowsAffected <= 0) {
                        console.log('Patient update failed');
                    }
                }
            );
        });

        navigation.pop();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={styles.page}>
                <View style={{alignItems: 'center', backgroundColor: '#222'}}>
                    <View style={styles.section}>
                        <Text style={styles.headingText}>Edit Name</Text>
                        <TextInputField
                            placeholder='Enter new name'
                            onChangeText={
                                (patientName) => setPatientName(patientName)
                            }
                            style={{padding: 25}}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headingText}>Edit Phone Number</Text>
                        <TextInputField
                            placeholder='Enter new phone number'
                            onChangeText={
                                (patientPhone) => setPatientPhone(patientPhone)
                            }
                            maxLength={10}
                            keyboardType="numeric"
                            style={{padding: 25}}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headingText}>Edit Email address</Text>
                        <TextInputField
                            placeholder='Enter new email address'
                            onChangeText={
                                (patientEmail) => setPatientAddress(patientEmail)
                            }
                            style={{padding: 25}}
                        />
                    </View>
                    <View style={styles.section}>
                        <View style={{marginTop: 45}}>
                            <SubmitButton title='Apply Changes' customClick={update_user}/>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
        flexDirection: 'column',
    },
    headingText: {
        margin: 40,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});