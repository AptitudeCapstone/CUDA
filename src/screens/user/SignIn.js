import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from "@react-native-firebase/auth";
import {buttons, fonts, format} from '../../style/Styles';
import {useAuth} from '../../auth/UserContext';

const SignIn = ({navigation}) => {
    const userInfo = useAuth();
    const userAuth = userInfo.userAuth;
    const userStatus = userInfo.user.status;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogIn = async () => {
        try {
            console.log('Attempting to log in with email/password');
            await logIn(email, password);
            Alert.alert('Signed In', 'You have been successfully signed in');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    //  log in via email, password
    //      if an account with this credential exists, link them
    //      else, log in
    const logIn = async (email, password) => {
        if (userStatus !== 'guest') {
            throw new Error("No anonymous sign in detected - this should not happen");
        }

        const credential = auth.EmailAuthProvider.credential(email, password);
        // first, attempt to link anonymous/google/apple user to existing
        userAuth.linkWithCredential(credential)
            .catch(error => {
                if (error.code === 'auth/wrong-password')
                    throw new Error('Password is incorrect');
                else if (error.code === 'auth/user-not-found')
                    throw new Error('Account was not found with that email');
                else {
                    // account exists
                    auth().signInWithCredential(credential)
                        .catch(error => {
                            if (error.code === 'auth/wrong-password')
                                throw new Error('Password is incorrect');
                            else if (error.code === 'auth/user-not-found')
                                throw new Error('Account was not found with that email');
                        });
                }
            });
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

export default SignIn;