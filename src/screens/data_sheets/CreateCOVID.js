import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {buttons, fonts, format, rbSheetStyle} from "../../style/Styles";
import {Alert, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from "react-native";
import useAuth from "../../auth/UserContext";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import database from "@react-native-firebase/database";

export const CreateCOVID = ({modalRef}) => {
    const [patientName, setPatientName] = useState(''),
        [patientEmail, setPatientEmail] = useState(''),
        [patientPhone, setPatientPhone] = useState(0),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization,
        dimensions = useWindowDimensions();

    const registerPatient = () => {
        if (!organization) {
            // find the next available QR ID and use that for the next patient
            database().ref('/users/' + auth.uid + '/patients/covid-patients/')
                .orderByChild('qrId')
                .once('value', (snapshot) => {
                    let qrId = 1;
                    if (snapshot.val()) {
                        let takenQRs = [];
                        snapshot.forEach((data) => {takenQRs.push(data.val().qrId)});
                        while (takenQRs.includes(qrId))
                            qrId += 1;
                    }

                    const patientReference = database().ref('/users/' + auth.uid + '/patients/covid-patients/').push();
                    patientReference.update({
                        name: patientName,
                        qrId: qrId,
                        email: patientEmail,
                        phone: patientPhone
                    }).then(() => console.log('Added entry for /users/' + auth.uid + '/patients/covid-patients/' + patientReference.key)
                    ).catch((error) => Alert.alert('Error', error));
                }).then(() => modalRef.current?.close());
        } else {
            // find the next available QR ID and use that for the next patient
            database().ref('/organizations/' + organization + '/patients/covid-patients/')
                .orderByChild('qrId')
                .once('value', (snapshot) => {
                    let qrId = 1;
                    if (snapshot.val()) {
                        let takenQRs = [];
                        snapshot.forEach((data) => {takenQRs.push(data.val().qrId)});
                        while (takenQRs.includes(qrId))
                            qrId += 1;
                    }

                    const newPatient = database().ref('/organizations/' + organization + '/patients/covid-patients/').push();
                    newPatient.update({
                        name: patientName,
                        qrId: qrId,
                        email: patientEmail,
                        phone: patientPhone,
                    }).then(() => {
                        console.log('Added entry for /organizations/' + organization + '/patients/covid-patients/' + newPatient.key);
                    }).catch((error) => {
                        Alert.alert('Error', error);
                    });
                }).then(() => modalRef.current?.close());
        }
    }


    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{paddingTop: 40, paddingBottom: 40}}>
                <Text style={fonts.heading}>Patient Info</Text>
                <Text style={fonts.smallText}>All fields are optional and can be edited after creation</Text>
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
                        blurOnSubmit={false}/>
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
                        blurOnSubmit={false}/>
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
                        blurOnSubmit={false}/>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={() => registerPatient()}>
                        <Text style={buttons.submitButtonText}>Create Patient</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </RBSheet>
    );
}