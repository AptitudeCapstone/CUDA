import React, {useEffect, useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {Alert, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {buttons, fonts, format, rbSheetStyle} from '../../style/Styles';
import {useAuth} from "../../auth/UserContext";

const EditAccount = ({modalRef}) => {
    const userInfo = useAuth(),
        [name, setName] = useState(null),
        [newPassword, setNewPassword] = useState(null),
        [newEmail, setNewEmail] = useState(null),
        [showEmailPass, setShowEmailPass] = useState(true),
        dimensions = useWindowDimensions();

    useEffect(() => {
        JSON.stringify(userInfo, null, 2);
        const isEmailPassAccount = userInfo.userAuth.providerId === 'password' ||
            (userInfo.userAuth.providerData[0] && userInfo.userAuth.providerData[0].providerId === 'password');
        setShowEmailPass(isEmailPassAccount);
    }, []);

    const handleEditUser = async () => {
        try {
            console.log('Attempting to edit user info');
            await editUser();
            Alert.alert('Success', 'Your information has been updated');
            modalRef.current?.close();
        } catch (error) {
            Alert.alert('Error', error.message);
            modalRef.current?.close();
        }
    }

    const editUser = async () => {
        if (newPassword != null) await userInfo.userAuth.updatePassword(newPassword);

        if (newEmail != null) await userInfo.userAuth.updateEmail(newEmail);

        if (name != null) await userInfo.userData.ref.update({displayName: name});
    }

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <ScrollView>
                <Text style={fonts.heading}>
                    Update Name
                </Text>
                <TextInput underlineColorAndroid='transparent'
                           placeholder='New Name'
                           placeholderTextColor='#aaa'
                           keyboardType='default'
                           onChangeText={(name) => setName(name)}
                           numberOfLines={1}
                           multiline={false}
                           style={format.textBox}
                           blurOnSubmit={false}/>
                {
                    showEmailPass
                        ? (
                            <>
                                <View style={{alignItems: 'center', paddingTop: 30, paddingBottom: 10, paddingHorizontal: 40,}}>
                                    <Text style={[fonts.mediumText, format.fieldName]}>
                                        Update Email Address
                                    </Text>
                                </View>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='New Email address'
                                           placeholderTextColor='#aaa'
                                           keyboardType='email-address'
                                           onChangeText={(email) => setNewEmail(email)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <Text style={fonts.heading}>Update Password</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='New Password'
                                           placeholderTextColor='#aaa'
                                           onChangeText={(password) => setNewPassword(password)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </>
                            ) : null
                }

                <TouchableOpacity style={buttons.submitButton} onPress={() => handleEditUser()}>
                    <Text style={buttons.submitButtonText}>
                        Apply Changes
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </RBSheet>
    );
}

export default EditAccount;