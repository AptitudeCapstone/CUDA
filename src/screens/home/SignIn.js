import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import {useUserAuth} from "../../contexts/UserContext";

export const SignIn = ({navigation, route}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {logIn} = useUserAuth();

    const handleLogIn = async () => {
        try {
            console.log('attempting to log in with email/password');
            await logIn(email, password);
            Alert.alert('Signed In', 'You have been successfully signed in');
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Error', error.message);
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
                <View>
                    <Text style={fonts.heading}>Sign In</Text>
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
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Password'
                            placeholderTextColor='#bbb'
                            onChangeText={(password) => setPassword(password)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 20, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={handleLogIn}
                    >
                        <Text style={buttons.submitButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <Text style={buttons.submitButtonText}>Forgot Password?</Text>
                    <TouchableOpacity
                        style={buttons.forgotPasswordButton}
                        onPress={() => navigation.navigate('Forgot Password')}
                    >
                        <Text style={buttons.submitButtonText}>Send Recovery Link</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}