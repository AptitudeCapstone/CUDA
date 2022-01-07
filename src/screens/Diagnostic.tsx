import React, {useState} from 'react';
import {
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
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
            const date = new Date();
            tx.executeSql(
                'INSERT INTO table_tests (patient_id, test_type, test_result, test_time) VALUES (?,?,?,?)',
                [patientID, testType, testResult, date.toISOString()],
                (tx, results) => {
                    console.log(results.rows.item(0).test_time + ' is date of new test');
                    console.log('Results', results.rowsAffected);
                    navigation.navigate('AllResults')
                }
            );
        });
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={{flex: 1}}
            >
                <View style={styles.page}>
                    <View style={styles.section}>
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
                                placeholder='Enter test ID (0 or 1)'
                                placeholderTextColor='#bbb'
                                keyboardType='numeric'
                                onChangeText={(testType) => setTestType(testType)}
                                numberOfLines={1}
                                multiline={false}
                                style={{padding: 25}}
                                blurOnSubmit={false}
                            />
                        </View>
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
                                placeholder='Enter result'
                                placeholderTextColor='#bbb'
                                keyboardType='numeric'
                                onChangeText={(testResult) => setTestResult(testResult)}
                                numberOfLines={1}
                                multiline={false}
                                style={{padding: 25}}
                                blurOnSubmit={false}
                            />
                        </View>
                        <View style={styles.testButtonContainer}>
                            <TouchableOpacity
                                onPress={add_test_result}
                                style={styles.testButton}
                            >
                                <Text style={styles.testButtonText}>Log Test Result</Text>
                            </TouchableOpacity>
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
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
    },
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});