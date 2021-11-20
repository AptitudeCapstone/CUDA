import React, {useEffect, useReducer, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import Icon from 'react-native-vector-icons/AntDesign';
import {openDatabase} from 'react-native-sqlite-storage';

// display patient info

// section 1: allow editing patient data
// tapping pencil opens edit patient screen

// section 2: covid
// - most recent test result / number of days ago (or hours if < 1 day)

// section 3: fibrinogen
// - most recent test result / number of days ago (or hours if < 1 day)

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const Patient = ({route, navigation}) => {

    const {patient_id, patient_name, patient_phone, patient_address} = route.params;

    let [covidTests, setCovidTests] = useState([]);
    let [fibTests, setFibTests] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=0 AND patient_id=' + (patient_id - 1),
                [],
                (tx, results) => {
                    setCovidTests(results.rows.length);
                }
            );
            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=1 AND patient_id=' + (patient_id - 1),
                [],
                (tx, results) => {
                    setFibTests(results.rows.length);
                }
            );
        });
    }, []);

    return(
        <SafeAreaView style={styles.page}>
            <View styles={styles.section}>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{patient_name}</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('EditPatient', {navigation, patient_id, patient_name, patient_phone, patient_address})} name='edit' size={36}
                              color='#fff'/>
                    </Text>
                </View>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>COVID Tests</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('COVID', {navigation, patient_id})} name='arrowright' size={24}
                            color='#fff'/>
                    </Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.infoText}>{covidTests} recorded COVID tests</Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.infoText}>Last test was 1 day ago</Text>
                </View>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Fibrinogen Tests</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('Fibrinogen', {navigation, patient_id})} name='arrowright' size={24}
                              color='#fff'/>
                    </Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.infoText}>{fibTests} recorded fibrinogen tests</Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.infoText}>Last test was 4 days ago</Text>
                </View>
            </View>
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
        flexDirection: 'row',
    },
    nameText: {
        fontSize: 36,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
        fontWeight: 'bold'
    },
    infoText: {
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'left'
    },
    headingContainer: {
        backgroundColor: '#333',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
        fontWeight: 'bold'
    },
    subheadingContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    subheadingText: {
        fontSize: 14,
        color: '#fff',
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
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#3cba3c',
        padding: 40,
        alignSelf: 'stretch'
    },
    testButtonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});