import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../Styles';
import {useAuth} from "../../contexts/UserContext";

const EditAccount = ({navigation, route}) => {
    const userInfo = useAuth();
    const [name, setName] = useState(null);
    const [newPassword, setNewPassword] = useState(null);
    const [newEmail, setNewEmail] = useState(null);
    const [showEmailPass, setShowEmailPass] = useState(true);

    useEffect(() => {
        JSON.stringify(userInfo, null, 2);
        setShowEmailPass(userInfo.userAuth.providerData[0].providerId !== 'google.com');
    }, []);

    const handleEditUser = async () => {
        try {
            console.log('Attempting to edit user info');
            await editUser();
            Alert.alert('Success', 'Your information has been updated');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const editUser = async () => {
        if (newPassword != null) {
            await userInfo.userAuth.updatePassword(newPassword);
        }

        if (newEmail != null) {
            await userInfo.userAuth.updateEmail(newEmail);
        }

        if (name != null) {
            await userInfo.userData.ref.update({displayName: name});
        }
    }


    return (
        <SafeAreaView style={format.page}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
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
                        onPress={handleEditUser}
                    >
                        <Text style={buttons.submitButtonText}>Apply Changes</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

export default EditAccount;