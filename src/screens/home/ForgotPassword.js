import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {buttons, fonts, format} from '../../style/style';

export const ForgotPassword = ({navigation, route}) => {
    const [email, setEmail] = useState('');

    const handleSendEmail = async () => {
        try {
            console.log('Attempting to edit user info');
            await sendEmail();
            Alert.alert('Recovery email Sent', 'Please check your email for instructions');
            navigation.navigate('Sign In');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const sendEmail = async () => {
        await auth().sendPasswordResetEmail(email);
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
                <Text style={fonts.heading}>Email address</Text>
                <View style={format.textBox}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder='Email address'
                        placeholderTextColor='#bbb'
                        keyboardType='email-address'
                        onChangeText={(email) => setEmail(email)}
                        numberOfLines={1}
                        multiline={false}
                        style={{padding: 20, color: '#fff'}}
                        blurOnSubmit={false}
                    />
                </View>

                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={handleSendEmail}
                    >
                        <Text style={buttons.submitButtonText}>Send Recovery Email</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}