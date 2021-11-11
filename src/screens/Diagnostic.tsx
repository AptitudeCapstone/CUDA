import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import TextInputField from '../components/TextInputField';
import SubmitButton from '../components/SubmitButton';
import { openDatabase } from 'react-native-sqlite-storage';

var db = openDatabase({ name: 'PatientDatabase.db' }, () => {}, error => {console.log('ERROR: ' + error)});

export const Diagnostic = ({navigation}) => {
    let [patientId, setPatientId] = useState('');
    let [testType, setTestType] = useState('');
    let [testResult, setTestResult] = useState('');

    let add_test_result = () => {
        db.transaction(function (tx) {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS table_tests(test_id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, test_type INT(8), test_result VARCHAR(255), test_time TEXT)',
                []
            );
            tx.executeSql(
                'INSERT INTO table_tests (patient_id, test_type, test_result, test_time) VALUES (?,?,?,datetime("now"))',
                [patientId, testType, testResult],
                (tx, results) => {
                    console.log('Results', results.rowsAffected);
                    navigation.navigate('AllResults')
                }
            );
        });
    }

    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity
                style={styles.navButton}
            >
                <Text style={styles.navButtonText}>Begin test for a new patient</Text>
            </TouchableOpacity>
            <TextInputField
                placeholder='Enter patient ID'
                onChangeText={
                    (patientId) => setPatientId(patientId)
                }
                maxLength={10}
                keyboardType="numeric"
                style={{ padding: 25 }}
            />
            <TextInputField
                placeholder='Enter test ID (0 or 1)'
                onChangeText={
                    (testType) => setTestType(testType)
                }
                maxLength={10}
                keyboardType="numeric"
                style={{ padding: 25 }}
            />
            <TextInputField
                placeholder='Enter result'
                onChangeText={
                    (testResult) => setTestResult(testResult)
                }
                maxLength={10}
                keyboardType="numeric"
                style={{ padding: 25 }}
            />
            <View style={{marginTop: 45}}>
                <SubmitButton title='Log Test Result' customClick={add_test_result} />
            </View>
            <TouchableOpacity
                style={styles.navButton}
            >
                <Text style={styles.navButtonText}>Begin test for an existing patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.navButton}
            >
                <Text style={styles.navButtonText}>Begin test without patient ID</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#eee',
        flex: 1,
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row',
    },
    headingContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 18,
        color: '#222',
        flex: 1,
        textAlign: 'left',
    },
    subheadingContainer: {
        paddingTop: 0,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    subheadingText: {
        fontSize: 14,
        color: '#222',
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
        backgroundColor: '#4287f5',
        padding: 15,
        alignSelf: 'stretch',
        borderBottomWidth: 4,
        borderBottomColor: '#326dc9',
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
        backgroundColor: '#2cd46a',
        padding: 25,
        alignSelf: 'stretch'
    },
    testButtonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});