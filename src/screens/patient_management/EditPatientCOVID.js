import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from "@react-native-firebase/database";
import {buttons, fonts, format} from '../../style';
import {useAuth} from "../../contexts/UserContext";

const EditPatientCOVID = ({route, navigation}) => {
    const {patientKey} = route.params;

    // text field values
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientPhone, setPatientPhone] = useState(0);
    const [patientStreetAddress1, setPatientStreetAddress1] = useState('');
    const [patientStreetAddress2, setPatientStreetAddress2] = useState('');
    const [patientCity, setPatientCity] = useState('');
    const [patientState, setPatientState] = useState('');
    const [patientZip, setPatientZip] = useState(0);
    const userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization;

    const update_patient = () => {
        let patient = null;
        if (!organization) {
            patient = database().ref('/users/' + auth.uid + '/patients/covid-patients/' + patientKey);
        } else {
            patient = database().ref('/organizations/' + organization + '/patients/covid-patients/' + patientKey)
        }

        // first get current patient info
        // if not empty, and not equal to current value, update the value
        patient.once('value', function (patientSnapshot) {
            console.log(patientSnapshot.val());
            if (patientSnapshot.val()) {

                if (patientName !== patientSnapshot.val().name && patientName !== '') {
                    patient.update({name: patientName});
                }

                if (patientEmail !== patientSnapshot.val().email && patientEmail !== '') {
                    patient.update({email: patientEmail});
                }

                if (patientPhone !== patientSnapshot.val().phone && patientPhone !== '') {
                    patient.update({phone: patientPhone});
                }

                if (patientStreetAddress1 !== patientSnapshot.val().streetAddress1 && patientStreetAddress1 !== '') {
                    patient.update({streetAddress1: patientStreetAddress1});
                }

                if (patientStreetAddress2 !== patientSnapshot.val().streetAddress2 && patientStreetAddress2 !== '') {
                    patient.update({streetAddress2: patientStreetAddress2});
                }

                if (patientCity !== patientSnapshot.val().city && patientCity !== '') {
                    patient.update({city: patientCity});
                }

                if (patientState !== patientSnapshot.val().state && patientState !== '') {
                    patient.update({state: patientState});
                }

                if (patientZip !== patientSnapshot.val().zip && patientZip !== '') {
                    patient.update({zip: patientZip});
                }
            }
        }).then(() => {
            Alert.alert('Success', 'Changes have been applied')
        });
    }

    return (
        <SafeAreaView style={format.page}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <Text style={fonts.heading}>Edit Patient Info</Text>
                <Text style={fonts.smallText}>All fields are optional and can always be edited</Text>
                <Text> </Text>
                <Text style={fonts.subheading}>Name</Text>
                <View style={format.textBox}>
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
                <Text style={fonts.subheading}>Email</Text>
                <View style={format.textBox}>
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
                <Text style={fonts.subheading}>Phone</Text>
                <View style={format.textBox}>
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
                <Text style={fonts.subheading}>Address</Text>
                <View style={format.textBox}>
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
                <View style={format.textBox}>
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
                <View style={format.textBox}>
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
                <View style={format.textBox}>
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
                <View style={format.textBox}>
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
                <View style={format.textBox}>
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
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={() => update_patient}
                    >
                        <Text style={buttons.submitButtonText}>Apply Changes</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

export default EditPatientCOVID;