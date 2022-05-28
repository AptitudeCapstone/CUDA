import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {buttons, fonts, format, rbSheetStyle} from "../../style/Styles";
import {Alert, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from "react-native";
import useAuth from "../../auth/UserContext";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import database from "@react-native-firebase/database";

export const EditCOVID = ({modalRef, patientKey}) => {
    const [patientName, setPatientName] = useState(''),
        [patientEmail, setPatientEmail] = useState(''),
        [patientPhone, setPatientPhone] = useState(0),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization,
        dimensions = useWindowDimensions();

    const updatePatient = () => {
        let patient = null;
        patient = (organization)
            ? patient = database().ref('/organizations/' + organization + '/patients/covid-patients/' + patientKey)
            : database().ref('/users/' + auth.uid + '/patients/covid-patients/' + patientKey);

        // first get current patient info
        // if not empty, and not equal to current value, update the value
        patient.once('value', (patientSnapshot) => {
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
            }
        }).then(() => {
            Alert.alert('Success', 'Changes have been applied')
            modalRef.current?.close();
        }).catch((error) => Alert.alert('Error', error));
    }


    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <ScrollView>
                <Text style={fonts.heading}>Edit Patient Info</Text>
                <Text style={fonts.smallText}>All fields are optional and can always be edited</Text>
                <Text style={[fonts.mediumText, format.fieldName]}>Name</Text>
                <View style={format.textBox}>
                    <TextInput underlineColorAndroid='transparent'
                               placeholder='Name'
                               placeholderTextColor='#aaa'
                               keyboardType='default'
                               onChangeText={(patientName) => setPatientName(patientName)}
                               numberOfLines={1}
                               multiline={false}
                               style={format.textBox}
                               blurOnSubmit={false}/>
                </View>
                <Text style={[fonts.mediumText, format.fieldName]}>Email</Text>
                <View style={format.textBox}>
                    <TextInput underlineColorAndroid='transparent'
                               placeholder='Email address'
                               placeholderTextColor='#aaa'
                               keyboardType='email-address'
                               onChangeText={(patientEmail) => setPatientEmail(patientEmail)}
                               numberOfLines={1}
                               multiline={false}
                               style={format.textBox}
                               blurOnSubmit={false}/>
                </View>
                <Text style={[fonts.mediumText, format.fieldName]}>Phone</Text>
                <View style={format.textBox}>
                    <TextInput underlineColorAndroid='transparent'
                               placeholder='Phone number'
                               placeholderTextColor='#aaa'
                               keyboardType='numeric'
                               onChangeText={(patientPhone) => setPatientPhone(patientPhone)}
                               numberOfLines={1}
                               multiline={false}
                               style={format.textBox}
                               blurOnSubmit={false}/>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity style={buttons.submitButton}
                                      onPress={() => updatePatient()}>
                        <Text style={buttons.submitButtonText}>Apply Changes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </RBSheet>);
}