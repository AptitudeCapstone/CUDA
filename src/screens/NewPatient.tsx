import React, { useState } from 'react';
import { View,
    Text,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import SubmitButton from '../components/SubmitButton';
import TextInputField from '../components/TextInputField';
import { openDatabase } from 'react-native-sqlite-storage';

let db = openDatabase({name: 'PatientDatabase.db'});

export const NewPatient = ({navigation}) => {
    let [userName, setUserName] = useState('');
    let [userContact, setUserContact] = useState('');
    let [userAddress, setUserAddress] = useState('');

    let register_user = () => {
        console.log(userName, userContact, userAddress);

        if (!userName) {
            alert('Please fill name');
            return;
        }
        if (!userContact) {
            alert('Please fill Contact Number');
            return;
        }
        if (!userAddress) {
            alert('Please fill Address');
            return;
        }

        db.transaction(function (tx) {
            tx.executeSql(
                'INSERT INTO table_patients (user_name, user_contact, user_address) VALUES (?,?,?)',
                [userName, userContact, userAddress],
                (tx, results) => {
                    console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                        Alert.alert(
                            'Success',
                            'You are Registered Successfully',
                            [
                                {
                                    text: 'Ok',
                                    onPress: () => navigation.navigate('HomeScreen'),
                                },
                            ],
                            { cancelable: false }
                        );
                    } else alert('Registration Failed');
                }
            );
        });
    };

    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>

            {/* QR code recognition */}

            <ScrollView keyboardShouldPersistTaps="handled">
                <KeyboardAvoidingView
                    behavior="padding"
                    style={{ flex: 1, justifyContent: 'space-between' }}>
                    <TextInputField
                        placeholder="Enter Name"
                        onChangeText={
                            (userName) => setUserName(userName)
                        }
                        style={{ padding: 10 }}
                    />
                    <TextInputField
                        placeholder="Enter Contact No"
                        onChangeText={
                            (userContact) => setUserContact(userContact)
                        }
                        maxLength={10}
                        keyboardType="numeric"
                        style={{ padding: 10 }}
                    />
                    <TextInputField
                        placeholder="Enter Address"
                        onChangeText={
                            (userAddress) => setUserAddress(userAddress)
                        }
                        maxLength={225}
                        numberOfLines={5}
                        multiline={true}
                        style={{ textAlignVertical: 'top', padding: 10 }}
                    />
                    <SubmitButton title="Submit" customClick={register_user} />
                </KeyboardAvoidingView>
            </ScrollView>

        </View>
    );
}