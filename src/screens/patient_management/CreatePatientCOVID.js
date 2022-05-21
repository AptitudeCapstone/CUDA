import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from "@react-native-firebase/database";
import {buttons, fonts, format} from '../../style';
import {useIsFocused} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {useAuth} from "../../contexts/UserContext";

const CreatePatientCOVID = ({navigation}) => {
    // text field values
    const [patientName, setPatientName] = useState(''),
        [patientEmail, setPatientEmail] = useState(''),
        [patientPhone, setPatientPhone] = useState(0),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization;

    const register_user = () => {
        if (!organization) {
            // find the next available QR ID and use that for the next patient
            database().ref('/users/' + auth.uid + '/patients/covid-patients/').orderByChild('qrId').once('value', function (snapshot) {

                let qrId = 1;
                if (snapshot.val()) {
                    let takenQRs = [];

                    snapshot.forEach(function (data) {
                        takenQRs.push(data.val().qrId);
                    });

                    while (takenQRs.includes(qrId))
                        qrId += 1;
                }

                const patientReference = database().ref('/users/' + auth.uid + '/patients/covid-patients/').push();

                patientReference.update({
                    name: patientName,
                    qrId: qrId,
                    email: patientEmail,
                    phone: patientPhone
                }).then(() => console.log('Added entry for /users/' + auth.uid + '/patients/covid-patients/' + patientReference.key));
            });
        } else {
            // find the next available QR ID and use that for the next patient
            database().ref('/organizations/' + organization + '/patients/covid-patients/').orderByChild('qrId').once('value', function (snapshot) {
                let qrId = 1;
                if (snapshot.val()) {
                    let takenQRs = [];

                    // @ts-ignore
                    snapshot.forEach(function (data) {
                        takenQRs.push(data.val().qrId);
                    });

                    while (takenQRs.includes(qrId))
                        qrId += 1;
                }

                const patientReference = database().ref('/organizations/' + organization + '/patients/covid-patients/').push();

                patientReference.update({
                    name: patientName,
                    qrId: qrId,
                    email: patientEmail,
                    phone: patientPhone,
                }).then(() => {
                    console.log('Added entry for /organizations/' + organization + '/patients/covid-patients/' + patientReference.key);
                    navigation.goBack();
                });
            });
        }
    }

    return (
        <SafeAreaView style={format.page}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{paddingTop: 40,paddingBottom: 40}}
            >
                <Text style={fonts.heading}>Patient Info</Text>
                <Text style={fonts.smallText}>All fields are optional and can be edited after creation</Text>
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
                <Text style={fonts.subheading}>Contact</Text>
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
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={register_user}
                    >
                        <Text style={buttons.submitButtonText}>Create Patient</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

export default CreatePatientCOVID;