import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Picker from 'react-native-wheel-picker';
import {useIsFocused} from "@react-navigation/native";
import {fonts, format, buttons} from '../../style/style';
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

                    // @ts-ignore
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

                    // @ts-ignore
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

    const BloodTypeSelector = () => {
        const [bloodType, setBloodType] = useState(null);

        return(
            <View>
                <View style={{flexDirection: 'row', padding: 10, justifyContent: 'center'}}>
                    <TouchableOpacity
                        style={(bloodType == 'A+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('A+')}
                    >
                        <Text style={fonts.selectButtonText}>A+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(bloodType == 'B+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('B+')}
                    >
                        <Text style={fonts.selectButtonText}>B+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(bloodType == 'AB+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('AB+')}
                    >
                        <Text style={fonts.selectButtonText}>AB+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(bloodType == 'O+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('O+')}
                    >
                        <Text style={fonts.selectButtonText}>O+</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', padding: 10, justifyContent: 'center'}}>
                    <TouchableOpacity
                        style={(bloodType == 'A-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('A-')}
                    >
                        <Text style={fonts.selectButtonText}>A-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(bloodType == 'B-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('B-')}
                    >
                        <Text style={fonts.selectButtonText}>B-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(bloodType == 'AB-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('AB-')}
                    >
                        <Text style={fonts.selectButtonText}>AB-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(bloodType == 'O-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setBloodType('O-')}
                    >
                        <Text style={fonts.selectButtonText}>O-</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const SexSelector = () => {
        const [sex, setSex] = useState(null);

        return(
            <View style={{flexDirection: 'row', padding: 10, justifyContent: 'center'}}>
                <TouchableOpacity
                    style={(sex == 'Male') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                    onPress={() => setSex('Male')}
                >
                    <Text style={fonts.selectButtonText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(sex == 'Female') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                    onPress={() => setSex('Female')}
                >
                    <Text style={fonts.selectButtonText}>Female</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const AgeSelector = () => {
        const [age, setAge] = useState(null);

        return(
            <View>
                <Text style={fonts.smallText}>{age}</Text>

            </View>
        )
    }

    const HeightSelector = () => {
        return(
            <View>

            </View>
        )
    }

    const WeightSelector = () => {
        return(
            <View>

            </View>
        )
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
                <BloodTypeSelector />
                <Text style={fonts.subheading}>Sex</Text>
                <SexSelector />
                <Text style={fonts.subheading}>Age</Text>
                <AgeSelector />
                <Text style={fonts.subheading}>Height</Text>
                <HeightSelector />
                <Text style={fonts.subheading}>Weight</Text>
                <WeightSelector />
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