import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from "@react-native-firebase/database";

export const CreatePatient = ({navigation}) => {
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientPhone, setPatientPhone] = useState(0);
    const [patientStreetAddress1, setPatientStreetAddress1] = useState('');
    const [patientStreetAddress2, setPatientStreetAddress2] = useState('');
    const [patientCity, setPatientCity] = useState('');
    const [patientState, setPatientState] = useState('');
    const [patientCountry, setPatientCountry] = useState('');
    const [patientZip, setPatientZip] = useState(0);

    const register_user = () => {
        database().ref('/patients/').orderByChild('qrId').once('value', function (snapshot) {

            let qrId = 1;
            if (snapshot.val()) {
                let takenQRs = [];

                snapshot.forEach(function (data) {
                    takenQRs.push(data.val().qrId);
                });

                while(takenQRs.includes(qrId))
                    qrId += 1;
            }


            const patientReference = database().ref('/patients').push();

            patientReference
                .set({
                    name: patientName,
                    qrId: qrId,
                    email: patientEmail,
                    phone: patientPhone,
                    addressLine1: patientStreetAddress1,
                    addressLine2: patientStreetAddress2,
                    city: patientCity,
                    state: patientState,
                    country: patientCountry,
                    zip: patientZip
                })
                .then(() => console.log('Added entry for /users/' + patientReference.key));
        });
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    backgroundColor: '#222',
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View style={styles.section}>
                    <Text style={styles.headingText}>Name</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Name'
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
                    <Text style={styles.headingText}>Contact</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Email address'
                            placeholderTextColor='#bbb'
                            keyboardType='email-address'
                            onChangeText={(patientEmail) => setPatientEmail(patientEmail)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Phone number'
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
                    <Text style={styles.headingText}>Address</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Address line 1'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(patientStreetAddress1) => setPatientStreetAddress1(patientStreetAddress1)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Address line 2 (e.g. Apt. #1)'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(patientStreetAddress2) => setPatientStreetAddress2(patientStreetAddress2)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='City'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(patientCity) => setPatientCity(patientCity)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='State'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(patientState) => setPatientState(patientState)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Country'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(patientCountry) => setPatientCountry(patientCountry)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='5-digit zip code'
                            placeholderTextColor='#bbb'
                            keyboardType='numeric'
                            onChangeText={(patientZip) => setPatientZip(patientZip)}
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
    textBoxContainer: {
        marginLeft: 35,
        marginRight: 35,
        marginTop: 0,
        marginBottom: 20,
        borderColor: '#eee',
        borderWidth: 1,
        borderRadius: 5
    },
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