import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {buttons, fonts, format} from '../../style/style';


export const EditAccount = ({navigation, route}) => {
    const [name, setName] = useState(null);
    const [newPassword, setNewPassword] = useState(null);
    const [newEmail, setNewEmail] = useState(null);
    const [showEmailPass, setShowEmailPass] = useState(true);

    const user = auth().currentUser;

    useEffect(() => {
        setShowEmailPass(user.providerData[0].providerId != 'google.com');
    });


    const edit_user = () => {
        if (newPassword != null) {
            user.updatePassword(newPassword).catch((error) => {
                console.log(error);
            });
        }

        if (newEmail != null) {
            user.updateEmail(newEmail).catch((error) => {
                console.log(error);
            });
        }

        if (name != null) {
            user.updateProfile({displayName: name}).catch((error) => {
                console.log(error);
            });
        }
    }


    return (
        <SafeAreaView style={format.page}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    backgroundColor: '#333',
                    paddingTop: 40,
                    paddingBottom: 40,
                }}
            >
                <Text style={fonts.heading}>Update Name</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='New Name'
                        placeholderTextColor='#bbb'
                        keyboardType='default'
                        onChangeText={(name) => setName(name)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 20, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>
                {showEmailPass ? (<View><Text style={fonts.heading}>Update Email Address</Text>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='New Email address'
                            placeholderTextColor='#bbb'
                            keyboardType='email-address'
                            onChangeText={(email) => setNewEmail(email)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 20, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <Text style={fonts.heading}>Update Password</Text>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='New Password'
                            placeholderTextColor='#bbb'
                            onChangeText={(password) => setNewPassword(password)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 20, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View></View>) : (<View/>)}

                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={edit_user}
                    >
                        <Text style={buttons.submitButtonText}>Apply Changes</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}