import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
    const {
        patient_id,
        patient_qr_id,
        patient_name,
        patient_email,
        patient_phone,
        patient_street_address_1,
        patient_street_address_2,
        patient_city,
        patient_state,
        patient_country,
        patient_zip
    } = route.params;

    const [patientQrId, setPatientQrId] = useState(patient_qr_id);
    const [patientName, setPatientName] = useState(patient_name);
    const [patientEmail, setPatientEmail] = useState(patient_email);
    const [patientPhone, setPatientPhone] = useState(patient_phone);
    const [patientStreetAddress1, setPatientStreetAddress1] = useState(patient_street_address_1);
    const [patientStreetAddress2, setPatientStreetAddress2] = useState(patient_street_address_2);
    const [patientCity, setPatientCity] = useState(patient_city);
    const [patientState, setPatientState] = useState(patient_state);
    const [patientCountry, setPatientCountry] = useState(patient_country);
    const [patientZip, setPatientZip] = useState(patient_zip);

    const [covidTests, setCovidTests] = useState(0);
    const [fibTests, setFibTests] = useState(0);

    const [lastCovidLength, setLastCovidLength] = useState(0);
    const [lastFibLength, setLastFibLength] = useState(0);
    const [lastCovidUnits, setLastCovidUnits] = useState('days');
    const [lastFibUnits, setLastFibUnits] = useState('days');

    // this is run once each time screen is opened
    const isFocused = useIsFocused();

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

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_patients WHERE id=' + patient_id,
                [],
                (tx, results) => {
                    let patient = results.rows.item(0);
                    setPatientQrId(patient.qrId);
                    console.log(patient.qrId);
                    setPatientName(patient.name);
                    setPatientEmail(patient.email);
                    setPatientPhone(patient.phone);
                    setPatientStreetAddress1(patient.street_address_1);
                    setPatientStreetAddress2(patient.street_address_2);
                    setPatientCity(patient.city);
                    setPatientState(patient.state);
                    setPatientCountry(patient.country);
                    setPatientZip(patient.zip);
                }
            );

            tx.executeSql(
                'SELECT * FROM table_tests WHERE type=0 AND patient_id=' + patient_id + ' ORDER BY id DESC',
                [],
                (tx, results) => {
                    if (results.rows.length > 0) {
                        let timeBetween = timeBetweenDates(parseISO(results.rows.item(0).time));
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

                            setLastCovidLength(timeBetween.days);
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
                'SELECT * FROM table_tests WHERE type=1 AND patient_id=' + patient_id + ' ORDER BY id DESC',
                [],
                (tx, results) => {
                    if (results.rows.length > 0) {
                        let timeBetween = timeBetweenDates(parseISO(results.rows.item(0).time));
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
        <SafeAreaView style={{flex: 1, flexDirection: 'column', backgroundColor: '#222'}}>
            <View style={{flex: 1, flexDirection: 'column', backgroundColor: '#222', justifyContent: 'space-around'}}>

                <View style={styles.section}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.nameText}>{patientName}</Text>
                        <Text style={{textAlign: 'right'}}>
                            <Icon
                                onPress={() => {
                                    navigation.navigate('EditPatient', {
                                        navigation,
                                        patient_id,
                                        patient_qr_id: patientQrId,
                                        patient_name: patientName,
                                        patient_phone: patientPhone,
                                        patient_email: patientEmail,
                                        patient_street_address_1: patientStreetAddress1,
                                        patient_street_address_2: patientStreetAddress2,
                                        patient_city: patientCity,
                                        patient_state: patientState,
                                        patient_country: patientCountry,
                                        patient_zip: patientZip
                                    })
                                }
                                }
                                name='edit'
                                size={36}
                                color='#fff'
                            />
                        </Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={{flex: 0.5, paddingLeft: 20, paddingRight: 20}}>
                        <Text style={styles.sectionText}>Contact</Text>
                        <Text style={styles.text}>{patientEmail}</Text>
                        <Text style={styles.text}>{patientPhone}</Text>
                    </View>
                    <View style={{flex: 0.5, paddingLeft: 20, paddingRight: 20}}>
                        <Text style={styles.sectionText}>Address</Text>
                        <Text style={styles.text}>{patientStreetAddress1}</Text>
                        <Text style={styles.text}>{patientStreetAddress2}</Text>
                        <Text
                            style={styles.text}>{patientCity + ', ' + patientState + ', ' + patientCountry + ', ' + patientZip}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <TouchableOpacity
                        style={{flexDirection: 'row', flex: 1}}
                        onPress={() => {
                            navigation.navigate('COVID', {
                                navigation,
                                patient_id
                            })
                        }}
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
                <View style={styles.section}>
                    <TouchableOpacity
                        style={{flexDirection: 'row', flex: 1}}
                        onPress={() => {
                            navigation.navigate('Fibrinogen', {
                                navigation,
                                patient_id
                            })
                        }}
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