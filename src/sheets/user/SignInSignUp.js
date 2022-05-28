import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {Alert, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from "@react-native-firebase/auth";
import {buttons, fonts, format, rbSheetStyle} from '../../style/Styles';
import {useAuth} from '../../auth/UserContext';
import {handleLogInGoogle, logOut} from "../../auth/Auth";

const SignInSignUp = ({modalRef, editAccountModalRef}) => {
    const userInfo = useAuth(),
        userAuth = userInfo.userAuth,
        userStatus = userInfo.user.status,
        [email, setEmail] = useState(''),
        [password, setPassword] = useState(''),
        dimensions = useWindowDimensions();

    const handleLogIn = async () => {
        try {
            console.log('Attempting to log in with email/password');
            await logIn(email, password);
            Alert.alert('Signed In', 'You have been successfully signed in');
            modalRef.current?.close();
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

    const handleSendEmail = async () => {
        try {
            console.log('Attempting to edit user info');
            await sendEmail();
            Alert.alert('Recovery email Sent', 'Please check your email for instructions');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const sendEmail = async () => {
        await auth().sendPasswordResetEmail(email);
    }

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <KeyboardAwareScrollView extraScrollHeight={150} style={{paddingTop: 40, paddingBottom: 40}}>
                {
                        (userInfo.loginStatus === 'guest')
                            ? <>
                                <View>
                                    <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                                      onPress={handleLogInGoogle(userInfo)}>
                                        <Text style={fonts.mediumText}>Sign in with Google</Text>
                                    </TouchableOpacity>
                                    <Text style={fonts.heading}>Sign in with email</Text>
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
                                            blurOnSubmit={false}/>
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
                                            blurOnSubmit={false}/>
                                    </View>
                                </View>
                                <View style={buttons.submitButtonContainer}>
                                    <TouchableOpacity
                                        style={buttons.submitButton}
                                        onPress={() => handleLogIn()}>
                                        <Text style={buttons.submitButtonText}>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={buttons.submitButtonContainer}>
                                    <Text style={buttons.submitButtonText}>Forgot Password?</Text>
                                    <TouchableOpacity
                                        style={buttons.forgotPasswordButton}
                                        onPress={() => handleSendEmail()}>
                                        <Text style={buttons.submitButtonText}>Send Recovery Link</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                            : <View style={{padding: 20}}>
                                <Text style={fonts.bigText}>There has been an error. Try restarting the app. </Text>
                            </View>
                }
            </KeyboardAwareScrollView>
        </RBSheet>
    );
}

export default SignInSignUp;