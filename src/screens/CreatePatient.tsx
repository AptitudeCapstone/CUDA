import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {}, error => {console.log('ERROR: ' + error)});

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
                'INSERT INTO table_patients (patient_name, patient_contact, patient_address) VALUES (?,?,?)',
                [patientName, patientPhone, patientEmail],
                (tx, results) => {
                    //console.log('Results', results.rowsAffected);
                    navigation.navigate('Home');
                }
            );
        });
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <KeyboardAwareScrollView
                extraScrollHeight={120}
                style={{
                    backgroundColor: '#222', paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View style={styles.section}>
                    <Text style={styles.headingText}>Name</Text>
                    <View
                        style={{
                            marginLeft: 35,
                            marginRight: 35,
                            marginTop: 10,
                            marginBottom: 20,
                            borderColor: '#eee',
                            borderWidth: 1,
                            borderRadius: 5
                        }}
                    >
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Enter name'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(patientName) => setPatientName(patientName)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.headingText}>Phone Number</Text>
                    <View
                        style={{
                            marginLeft: 35,
                            marginRight: 35,
                            marginTop: 10,
                            marginBottom: 20,
                            borderColor: '#eee',
                            borderWidth: 1,
                            borderRadius: 5
                        }}
                    >
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Enter phone number'
                            placeholderTextColor='#bbb'
                            keyboardType='numeric'
                            onChangeText={(patientPhone) => setPatientPhone(patientPhone)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.headingText}>Email address</Text>
                    <View
                        style={{
                            marginLeft: 35,
                            marginRight: 35,
                            marginTop: 10,
                            marginBottom: 20,
                            borderColor: '#eee',
                            borderWidth: 1,
                            borderRadius: 5
                        }}
                    >
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Enter email address'
                            placeholderTextColor='#bbb'
                            keyboardType='email-address'
                            onChangeText={(patientEmail) => setPatientEmail(patientEmail)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.testButtonContainer}>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={register_user}
                    >
                        <Text style={styles.testButtonText}>Create Patient</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-between',
    },
    section: {},
    headingText: {
        margin: 20,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#2cab5c',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        borderRadius: 50,
        marginTop: 40,
        marginBottom: 20,
    },
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});