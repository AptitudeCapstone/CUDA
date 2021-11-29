import React, {useState} from 'react';
import {Keyboard, SafeAreaView, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import TextInputField from '../components/TextInputField';
import SubmitButton from '../components/SubmitButton';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const Diagnostic = ({route, navigation}) => {
    const {patientID} = route.params;
    let [testType, setTestType] = useState('');
    let [testResult, setTestResult] = useState('');

    let add_test_result = () => {
        db.transaction(function (tx) {
            tx.executeSql(
                'INSERT INTO table_tests (patient_id, test_type, test_result, test_time) VALUES (?,?,?,datetime("now"))',
                [patientID, testType, testResult],
                (tx, results) => {
                    console.log('Results', results.rowsAffected);
                    navigation.navigate('AllResults')
                }
            );
        });
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={{flex: 1}}>
                <View style={styles.page}>
                    <View style={styles.section}>
                        <TextInputField
                            placeholder='Enter test ID (0 or 1)'
                            onChangeText={
                                (testType) => setTestType(testType)
                            }
                            maxLength={10}
                            keyboardType="numeric"
                            style={{padding: 25}}
                        />
                        <TextInputField
                            placeholder='Enter result'
                            onChangeText={
                                (testResult) => setTestResult(testResult)
                            }
                            maxLength={10}
                            keyboardType="numeric"
                            style={{padding: 25}}
                        />
                        <View style={{marginTop: 45}}>
                            <SubmitButton title='Log Test Result' customClick={add_test_result}/>
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
    },
    navButton: {
        backgroundColor: '#444',
        padding: 20,
        alignSelf: 'stretch',
        borderBottomWidth: 2,
        borderBottomColor: '#666',
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
    }
});