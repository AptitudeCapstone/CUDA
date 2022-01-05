import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import Icon from 'react-native-vector-icons/AntDesign';
import {openDatabase} from 'react-native-sqlite-storage';
import {useIsFocused} from '@react-navigation/native';
import {format, parseISO} from 'date-fns';


var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const Patient = ({route, navigation}) => {

    let {patient_id, patient_name, patient_phone, patient_address} = route.params;

    let [covidTests, setCovidTests] = useState(0);
    let [fibTests, setFibTests] = useState(0);
    let [patientName, setPatientName] = useState(patient_name);
    let [patientPhone, setPatientPhone] = useState(patient_phone);
    let [patientAddress, setPatientAddress] = useState(patient_address);

    let [lastCovidLength, setLastCovidLength] = useState(0);
    let [lastFibLength, setLastFibLength] = useState(0);
    let [lastCovidUnits, setLastCovidUnits] = useState('days');
    let [lastFibUnits, setLastFibUnits] = useState('days');

    // this is run once each time screen is opened
    const isFocused = useIsFocused();
    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_patients WHERE patient_id=' + patient_id,
                [],
                (tx, results) => {
                    let patient = results.rows.item(0);
                    setPatientName(patient.patient_name);
                    setPatientPhone(patient.patient_contact);
                    setPatientAddress(patient.patient_address);
                }
            );

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

            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=0 AND patient_id=' + patient_id + ' ORDER BY test_id DESC',
                [],
                (tx, results) => {
                    if (results.rows.length > 0) {
                        let timeBetween = timeBetweenDates(parseISO(results.rows.item(0).test_time));
                        console.log(timeBetween);
                        //console.log('at ' + format(parseISO(results.rows.item(0).test_time),  'MMM d @ hh:mm:ss aaaa'));
                        //console.log('current time is ' + format(Date.now(),  'MMM d @ hh:mm:ss aaaa'));
                        if (timeBetween.years > 0) {
                            setLastCovidLength(timeBetween.years);
                            if (timeBetween.years > 1)
                                setLastCovidUnits('years');
                            else
                                setLastCovidUnits('year');

                            setLastCovidLength(timeBetween.years);
                        } else if (timeBetween.months > 0) {
                            if (timeBetween.months > 1)
                                setLastCovidUnits('months');
                            else
                                setLastCovidUnits('month');

                            setLastCovidLength(timeBetween.months);
                        } else if (timeBetween.days >= 7) {
                            if (timeBetween.days >= 14)
                                setLastCovidUnits('weeks');
                            else
                                setLastCovidUnits('week');

                            setLastCovidLength(timeBetween.days / 7)
                        } else if (timeBetween.days > 0) {
                            if (timeBetween.days > 1)
                                setLastCovidUnits('days');
                            else
                                setLastCovidUnits('day');

                            setLastCovidLength(timeBetween.days / 7);
                        } else if (timeBetween.hours > 0) {
                            if (timeBetween.hours > 1)
                                setLastCovidUnits('hours');
                            else
                                setLastCovidUnits('hour');

                            setLastCovidLength(timeBetween.hours);
                        } else if (timeBetween.minutes > 0) {
                            if (timeBetween.minutes > 1)
                                setLastCovidUnits('minutes');
                            else
                                setLastCovidUnits('minute');

                            setLastCovidLength(timeBetween.minutes);
                        } else if (timeBetween.seconds > 0) {
                            if (timeBetween.seconds > 1)
                                setLastCovidUnits('seconds');
                            else
                                setLastCovidUnits('second');

                            setLastCovidLength(timeBetween.seconds);
                        }
                    }

                    var temp = [];

                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    setCovidTests(temp);

                    //console.log('Date of most recent test is ' + covidTests[0].test_time.getTime()).toString());
                }
            );

            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=1 AND patient_id=' + patient_id + ' ORDER BY test_id DESC',
                [],
                (tx, results) => {
                    if (results.rows.length > 0) {
                        let timeBetween = timeBetweenDates(parseISO(results.rows.item(0).test_time));
                        console.log(timeBetween);
                        console.log('at ' + format(parseISO(results.rows.item(0).test_time), 'MMM d @ hh:mm:ss aaaa'));
                        console.log('current time is ' + format(Date.now(), 'MMM d @ hh:mm:ss aaaa'));

                        if (timeBetween.years > 0) {
                            setLastFibLength(timeBetween.years);
                            if (timeBetween.years > 1)
                                setLastFibUnits('years');
                            else
                                setLastFibUnits('year');

                            setLastFibLength(timeBetween.years);
                        } else if (timeBetween.months > 0) {
                            if (timeBetween.months > 1)
                                setLastFibUnits('months');
                            else
                                setLastFibUnits('month');

                            setLastFibLength(timeBetween.months);
                        } else if (timeBetween.days >= 7) {
                            if (timeBetween.days >= 14)
                                setLastFibUnits('weeks');
                            else
                                setLastFibUnits('week');

                            setLastFibLength(timeBetween.days / 7)
                        } else if (timeBetween.days > 0) {
                            if (timeBetween.days > 1)
                                setLastFibUnits('days');
                            else
                                setLastFibUnits('day');

                            setLastFibLength(timeBetween.days / 7);
                        } else if (timeBetween.hours > 0) {
                            if (timeBetween.hours > 1)
                                setLastFibUnits('hours');
                            else
                                setLastFibUnits('hour');

                            setLastFibLength(timeBetween.hours);
                        } else if (timeBetween.minutes > 0) {
                            if (timeBetween.minutes > 1)
                                setLastFibUnits('minutes');
                            else
                                setLastFibUnits('minute');

                            setLastFibLength(timeBetween.minutes);
                        } else if (timeBetween.seconds > 0) {
                            if (timeBetween.seconds > 1)
                                setLastFibUnits('seconds');
                            else
                                setLastFibUnits('second');

                            setLastFibLength(timeBetween.seconds);
                        }
                    }

                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    setFibTests(temp);
                }
            );
        });
    }, [isFocused]);

    return (
        <SafeAreaView style={styles.page}>
            <View styles={styles.section}>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{patientName}</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('EditPatient', {
                            navigation,
                            patient_id,
                            patient_name: patientName,
                            patient_phone: patientPhone,
                            patient_address: patientAddress
                        })} name='edit' size={36}
                              color='#fff'
                        />
                    </Text>
                </View>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>COVID Tests</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('COVID', {navigation, patient_id})} name='arrowright'
                              size={24}
                              color='#fff'/>
                    </Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.infoText}>{covidTests.length} recorded COVID tests</Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text
                        style={styles.infoText}>{(covidTests.length > 0) ? 'Last test was ' + lastCovidLength + ' ' + lastCovidUnits + ' ago' : ''}</Text>
                </View>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Fibrinogen Tests</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('Fibrinogen', {navigation, patient_id})}
                              name='arrowright' size={24}
                              color='#fff'/>
                    </Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.infoText}>{fibTests.length} recorded fibrinogen tests</Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text
                        style={styles.infoText}>{(fibTests.length > 0) ? 'Last test was ' + lastFibLength + ' ' + lastFibUnits + ' ago' : ''}</Text>
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