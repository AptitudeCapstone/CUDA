import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Picker} from '@react-native-picker/picker';
import {buttons, fonts, format} from '../../Styles';
import database from '@react-native-firebase/database';
import {useAuth} from "../../contexts/UserContext";

const EditPatientFibrinogen = ({route, navigation}) => {
    const {patientKey} = route.params;
    const userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization;
    [patientName, setPatientName] = useState(null),
        [patientBloodType, setPatientBloodType] = useState(null),
        [patientSex, setPatientSex] = useState(null),
        [patientAge, setPatientAge] = useState(null),
        [patientHeight, setPatientHeight] = useState(null),
        [patientWeight, setPatientWeight] = useState(null);

    // add navigate to patient page after, and update patient that is selected
    const update_patient = () => {
        let patient = null;
        if (!organization) {
            patient = database().ref('/users/' + auth.uid + '/patients/fibrinogen-patients/' + patientKey);
        } else {
            patient = database().ref('/organizations/' + organization + '/patients/fibrinogen-patients/' + patientKey);
        }

        // first get current patient info
        // if not empty, and not equal to current value, update the value
        patient.once('value', function (patientSnapshot) {
            console.log(patientSnapshot.val());
            if (patientSnapshot.val()) {
                if (patientName !== patientSnapshot.val().name && patientName !== null) {
                    patient.update({name: patientName});
                }

                if (patientBloodType !== patientSnapshot.val().bloodType && patientBloodType !== null) {
                    patient.update({bloodType: patientBloodType});
                }

                if (patientSex !== patientSnapshot.val().sex && patientSex !== null) {
                    patient.update({sex: patientSex});
                }

                if (patientAge !== patientSnapshot.val().age && patientAge !== null) {
                    patient.update({age: patientAge});
                }

                if (patientWeight !== patientSnapshot.val().weight && patientWeight !== null) {
                    patient.update({weight: patientWeight});
                }

                if (patientHeight !== patientSnapshot.val().height && patientHeight !== null) {
                    patient.update({height: patientHeight});
                }
            }
        });

        Alert.alert('Successfully applied changes', 'Returning to patient portal');
        navigation.goBack();
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
        )
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
                <Text style={fonts.heading}>Edit Patient Info</Text>
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
                        onPress={update_patient}
                    >
                        <Text style={buttons.submitButtonText}>Apply Changes</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

export default EditPatientFibrinogen;