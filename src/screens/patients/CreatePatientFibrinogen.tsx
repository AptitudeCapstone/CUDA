import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useIsFocused} from "@react-navigation/native";
import {fonts, format} from '../../style/style';
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";

export const CreatePatientFibrinogen = ({navigation}) => {
    // text field values
    // get current user and org info
    // determines when page comes into focus
    // case 1: is connected to organization
    //  - upload to /users/patients/x
    // case 2: is not connected to organization
    //  - upload to /organizations/orgKey/patients/x
    const isFocused = useIsFocused(),
        [userInfo, setUserInfo] = useState(null),
        [orgInfo, setOrgInfo] = useState(null),
        [patientName, setPatientName] = useState(''),
        [patientBloodType, setPatientBloodType] = useState(''),
        [patientSex, setPatientSex] = useState(''),
        [patientAge, setPatientAge] = useState(0),
        [patientHeight, setPatientHeight] = useState(''),
        [patientWeight, setPatientWeight] = useState('');

    // update user info with current authenticated user info
    // also get organization info from user, update organization info
    useEffect(() => {
        if (auth().currentUser != null)
            // update user info based on database info
            database().ref('/users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                if (userSnapshot.val()) {
                    setUserInfo(userSnapshot.val());
                    if (userSnapshot.val().organization === undefined) {
                        setOrgInfo(null);
                    } else
                        database().ref('/organizations/' + userSnapshot.val().organization).once('value', function (orgSnapshot) {
                            setOrgInfo(orgSnapshot.val());
                        });
                }
            });
        else
            auth().signInAnonymously().then(() => {
                console.log('User signed in anonymously with uid ' + auth().currentUser.uid);
            }).catch(error => {
                console.error(error);
            });
    }, [isFocused]);

    const register_user = () => {
        if (orgInfo === null) {
            // find the next available QR ID and use that for the next patient
            database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/').orderByChild('qrId').once('value', function (snapshot) {

                let qrId = 1;
                if (snapshot.val()) {
                    let takenQRs = [];

                    snapshot.forEach(function (data) {
                        takenQRs.push(data.val().qrId);
                    });

                    while (takenQRs.includes(qrId))
                        qrId += 1;
                }


                const patientReference = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/').push();

                patientReference.update({
                    name: patientName,

                }).then(() => console.log('Added entry for /users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientReference.key));
            });
        } else {
            // find the next available QR ID and use that for the next patient
            database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/').orderByChild('qrId').once('value', function (snapshot) {

                let qrId = 1;
                if (snapshot.val()) {
                    let takenQRs = [];

                    snapshot.forEach(function (data) {
                        takenQRs.push(data.val().qrId);
                    });

                    while (takenQRs.includes(qrId))
                        qrId += 1;
                }


                const patientReference = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/').push();

                patientReference.update({
                    name: patientName,
                }).then(() => console.log('Added entry for /organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientReference.key));
            });
        }
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
                <Text style={fonts.subheading}>Blood Type</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='Email address'
                        placeholderTextColor='#bbb'
                        keyboardType='email-address'
                        onChangeText={(patientBloodType) => setPatientBloodType(patientBloodType)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 25, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
                <Text style={fonts.subheading}>Sex</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='Phone number'
                        placeholderTextColor='#bbb'
                        keyboardType='numeric'
                        onChangeText={(patientSex) => setPatientSex(patientSex)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 25, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
                <Text style={fonts.subheading}>Age</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='Address line 1'
                        placeholderTextColor='#bbb'
                        keyboardType='default'
                        onChangeText={(patientAge) => setPatientAge(patientAge)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 25, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
                <Text style={fonts.subheading}>Height</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='Address line 2 (e.g. Apt. #1)'
                        placeholderTextColor='#bbb'
                        keyboardType='default'
                        onChangeText={(patientHeight) => setPatientHeight(patientHeight)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 25, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
                <Text style={fonts.subheading}>Weight</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='City'
                        placeholderTextColor='#bbb'
                        keyboardType='default'
                        onChangeText={(patientWeight) => setPatientWeight(patientWeight)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 25, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}