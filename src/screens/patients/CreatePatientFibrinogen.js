import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Picker} from '@react-native-picker/picker';
import {useIsFocused} from '@react-navigation/native';
import {buttons, fonts, format} from '../../style/style';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

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
        [patientName, setPatientName] = useState(null),
        [patientBloodType, setPatientBloodType] = useState(null),
        [patientSex, setPatientSex] = useState(null),
        [patientAge, setPatientAge] = useState(null),
        [patientHeight, setPatientHeight] = useState(null),
        [patientWeight, setPatientWeight] = useState(null);

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
                    qrId: qrId,
                    name: patientName,
                    bloodType: patientBloodType,
                    sex: patientSex,
                    age: patientAge,
                    height: patientHeight,
                    weight: patientWeight
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
                    qrId: qrId,
                    name: patientName,
                    bloodType: patientBloodType,
                    sex: patientSex,
                    age: patientAge,
                    height: patientHeight,
                    weight: patientWeight
                }).then(() => {
                    console.log('Added entry for /organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientReference.key);
                    navigation.navigate('Patient');
                });
            });
        }
    }

    const BloodTypeSelector = () => {
        return (
            <View>
                <View style={{flexDirection: 'row', padding: 10, justifyContent: 'center'}}>
                    <TouchableOpacity
                        style={(patientBloodType == 'A+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('A+')}
                    >
                        <Text style={fonts.selectButtonText}>A+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(patientBloodType == 'B+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('B+')}
                    >
                        <Text style={fonts.selectButtonText}>B+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(patientBloodType == 'AB+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('AB+')}
                    >
                        <Text style={fonts.selectButtonText}>AB+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(patientBloodType == 'O+') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('O+')}
                    >
                        <Text style={fonts.selectButtonText}>O+</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', padding: 10, justifyContent: 'center'}}>
                    <TouchableOpacity
                        style={(patientBloodType == 'A-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('A-')}
                    >
                        <Text style={fonts.selectButtonText}>A-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(patientBloodType == 'B-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('B-')}
                    >
                        <Text style={fonts.selectButtonText}>B-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(patientBloodType == 'AB-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('AB-')}
                    >
                        <Text style={fonts.selectButtonText}>AB-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={(patientBloodType == 'O-') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                        onPress={() => setPatientBloodType('O-')}
                    >
                        <Text style={fonts.selectButtonText}>O-</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const SexSelector = () => {
        return (
            <View style={{flexDirection: 'row', padding: 10, justifyContent: 'center'}}>
                <TouchableOpacity
                    style={(patientSex == 'Male') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                    onPress={() => setPatientSex('Male')}
                >
                    <Text style={fonts.selectButtonText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(patientSex == 'Female') ? buttons.bloodTypeSelectButton : buttons.unselectedBloodTypeButton}
                    onPress={() => setPatientSex('Female')}
                >
                    <Text style={fonts.selectButtonText}>Female</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const AgeSelector = () => {
        let ages = [];
        for (let i = 0; i < 100; ++i)
            ages.push(i);

        return (
            <Picker
                itemStyle={{color: '#fff'}}
                selectedValue={patientAge}
                onValueChange={(itemValue, itemIndex) =>
                    setPatientAge(itemValue)
                }>
                {ages.map((prop, key) => {
                    return <Picker.Item key={key} label={key.toString()} value={key.toString()}/>
                })}
            </Picker>
        );
    }

    const [feet, setFeet] = useState(null);
    const [inch, setInch] = useState(null);

    const HeightSelector = () => {
        let feetChoices = [];
        for (let i = 0; i <= 7; ++i)
            feetChoices.push(i);

        let inchChoices = [];
        for (let i = 0; i <= 11; ++i)
            inchChoices.push(i);

        return (
            <View style={{flexDirection: 'row'}}>
                <Picker
                    style={{flexDirection: 'row', flex: 1}}
                    itemStyle={{color: '#fff', flexDirection: 'row', flex: 1}}
                    selectedValue={feet}
                    onValueChange={(itemValue, itemIndex) => {
                        setFeet(itemValue);
                        setPatientHeight(itemValue + 'ft. ' + inch + ' in.');
                    }}>
                    {feetChoices.map((prop, key) => {
                        return <Picker.Item key={key} label={key.toString()} value={key.toString()}/>
                    })}
                </Picker>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={fonts.mediumText}>ft.</Text>
                </View>
                <Picker
                    style={{flexDirection: 'row', flex: 1}}
                    itemStyle={{color: '#fff', flexDirection: 'row', flex: 1}}
                    selectedValue={inch}
                    onValueChange={(itemValue, itemIndex) => {
                        setInch(itemValue);
                        setPatientHeight(feet + ' ft. ' + itemValue + ' in.');
                    }}>
                    {inchChoices.map((prop, key) => {
                        return <Picker.Item key={key} label={key.toString()} value={key.toString()}/>
                    })}
                </Picker>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={fonts.mediumText}>in.</Text>
                </View>
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
                <Text style={fonts.subheadingSpaced}>Name</Text>
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
                <Text style={fonts.subheadingSpaced}>Blood Type</Text>
                <BloodTypeSelector/>
                <Text style={fonts.subheadingSpaced}>Sex</Text>
                <SexSelector/>
                <Text style={fonts.subheadingSpaced}>Weight</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='Weight (lb.)'
                        placeholderTextColor='#bbb'
                        keyboardType='numeric'
                        onChangeText={(patientWeight) => setPatientWeight(patientWeight + ' lb.')}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 25, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
                <Text style={fonts.subheadingSpaced}>Age</Text>
                <AgeSelector/>
                <Text style={fonts.subheadingSpaced}>Height</Text>
                <HeightSelector/>
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