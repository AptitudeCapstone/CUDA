import React, {useState} from 'react';
import {Keyboard, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import SubmitButton from '../components/SubmitButton';
import TextInputField from '../components/TextInputField';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const CreatePatient = ({navigation}) => {
    let [patientName, setPatientName] = useState('');
    let [patientPhone, setPatientPhone] = useState('');
    let [patientEmail, setPatientEmail] = useState('');

    let register_user = () => {
        console.log(patientName, patientPhone, patientEmail);

        if (!patientName) {
            alert('Patient name is required');
            return;
        }
        if (!patientPhone) {
            alert('Patient number is required');
            return;
        }
        if (!patientEmail) {
            alert('Patient email is required');
            return;
        }

        db.transaction(function (tx) {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS table_patients(patient_id INTEGER PRIMARY KEY AUTOINCREMENT, patient_name VARCHAR(30), patient_contact INT(15), patient_address VARCHAR(255))',
                []
            );
            tx.executeSql(
                'INSERT INTO table_patients (patient_name, patient_contact, patient_address) VALUES (?,?,?)',
                [patientName, patientPhone, patientEmail],
                (tx, results) => {
                    console.log('Results', results.rowsAffected);
                    navigation.navigate('Home')
                }
            );
        });
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={styles.page}>
                <View style={{alignItems: 'center', backgroundColor: '#222'}}>

                    {/* QR code recognition */}

                    <View style={styles.section}>
                        <Text style={styles.headingText}>Name</Text>
                        <TextInputField
                            placeholder='Enter name'
                            onChangeText={
                                (patientName) => setPatientName(patientName)
                            }
                            style={{padding: 25, color: '#fff'}}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headingText}>Phone Number</Text>
                        <TextInputField
                            placeholder='Enter phone number'
                            onChangeText={
                                (patientPhone) => setPatientPhone(patientPhone)
                            }
                            maxLength={10}
                            keyboardType="numeric"
                            style={{padding: 25, color: '#fff'}}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.headingText}>Email address</Text>
                        <TextInputField
                            placeholder='Enter email address'
                            onChangeText={
                                (patientEmail) => setPatientEmail(patientEmail)
                            }
                            style={{padding: 25, color: '#fff'}}
                        />
                    </View>
                    <View style={styles.section}>
                        <View style={{marginTop: 45}}>
                            <SubmitButton title='Create Patient' customClick={register_user}/>
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