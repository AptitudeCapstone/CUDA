import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {Alert, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from "@react-native-firebase/auth";
import {buttons, fonts, format, rbSheetStyle} from '../../style/Styles';
import {useAuth} from '../../auth/UserContext';
import {AppleSocialButton, GoogleSocialButton} from "react-native-social-buttons";

import appleAuth, {
    AppleButton,
    AppleAuthError,
    AppleAuthRequestScope,
    AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication'
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import database from "@react-native-firebase/database";


const SignInSignUp = ({modalRef}) => {
    const userInfo = useAuth(),
        userAuth = userInfo.userAuth,
        userStatus = userInfo.user?.status,
        [email, setEmail] = useState(''),
        [password, setPassword] = useState(''),
        dimensions = useWindowDimensions();

    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');

    const handleSignUp = async () => {
        try {
            console.log('Attempting to sign up');
            await signUp(createName, createEmail, createPassword);
            modalRef.current?.close();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    //  sign up via name, email password
    //      sets the user profile with desired name and
    //      then create user entry in database
    const signUp = async (name, email, password) => {
        //  * we assume this page is reached by an anonymous account *
        //  * this is because we create a guest account when         *
        //  * the user has not create an account or logged in        *
        if (userStatus !== 'guest') {
            throw new Error("No anonymous sign in detected - this should not happen");
        }

        if (password.length < 6) {
            throw new Error('Please use at least 6 characters for your password');
        }

        const credential = auth.EmailAuthProvider.credential(email, password);
        userAuth.linkWithCredential(credential)
            .then((userCredential) => {
                // add database entry for /users/user/displayName
                const userRef = database().ref('/users/' + userCredential.user.uid);
                //const userRef = userInfo.user.ref;
                userRef.set({displayName: name}).then(() => {
                    return true;
                });
            }).catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('That email address is already in use');
            } else if (error.code === 'auth/invalid-email') {
                throw new Error('That email address is invalid');
            } else {
                throw new Error(error);
            }
        });
    }

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

    const handleLogInGoogle = async (userInfo) => {
        try {
            await logInGoogle(userInfo);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const logInGoogle = async () => {
        GoogleSignin.configure({
            webClientId: "141405103878-rsc5n2819h3b7fors0u0oadthfv4dmde.apps.googleusercontent.com",
        });

        try {
            await GoogleSignin.hasPlayServices();
            const {idToken} = await GoogleSignin.signIn();
            modalRef.current?.close();
            const credential = auth.GoogleAuthProvider.credential(idToken);
            userInfo.userAuth.linkWithCredential(credential)
                .catch(() => {
                    auth().signInWithCredential(credential);
                });
            return true;
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                return true;
            } else if (error.code === statusCodes.IN_PROGRESS) {
                return true;
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error('Google play services are unavailable, try another login method.');
            }
            return false
        }
    }

    const handleSendEmail = async () => {
        try {
            await sendEmail();
            Alert.alert('Email sent', 'Check your email for instructions to recover your account');
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
                                    <View style={{marginBottom: 20, alignItems: 'center'}}>
                                        <AppleSocialButton buttonViewStyle={{margin: 10}} onPress={() => Alert.alert("Hello")} />
                                        <GoogleSocialButton buttonViewStyle={{margin: 10, padding: 10}} onPress={() => handleLogInGoogle()} />
                                    </View>
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
                                    <Text style={fonts.bigText}>Forgot Password?</Text>
                                    <TouchableOpacity
                                        style={buttons.forgotPasswordButton}
                                        onPress={() => handleSendEmail()}>
                                        <Text style={buttons.submitButtonText}>Send Recovery Link</Text>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <Text style={fonts.heading}>New Account</Text>
                                    <Text style={fonts.subheading}>Name</Text>
                                    <View style={format.textBox}>
                                        <TextInput
                                            underlineColorAndroid='transparent'
                                            placeholder='Name'
                                            placeholderTextColor='#bbb'
                                            keyboardType='default'
                                            onChangeText={(name) => setCreateName(name)}
                                            numberOfLines={1}
                                            multiline={false}
                                            style={{padding: 20, color: '#fff'}}
                                            blurOnSubmit={false}
                                        />
                                    </View>
                                    <Text style={fonts.subheading}>Email Address</Text>
                                    <View style={format.textBox}>
                                        <TextInput
                                            underlineColorAndroid='transparent'
                                            placeholder='Email address'
                                            placeholderTextColor='#bbb'
                                            keyboardType='email-address'
                                            onChangeText={(email) => setCreateEmail(email)}
                                            numberOfLines={1}
                                            multiline={false}
                                            style={{padding: 20, color: '#fff'}}
                                            blurOnSubmit={false}
                                        />
                                    </View>
                                    <Text style={fonts.subheading}>Password</Text>
                                    <View style={format.textBox}>
                                        <TextInput
                                            underlineColorAndroid='transparent'
                                            placeholder='Password (6+ characters)'
                                            placeholderTextColor='#bbb'
                                            onChangeText={(password) => setCreatePassword(password)}
                                            numberOfLines={1}
                                            multiline={false}
                                            style={{padding: 20, color: '#fff'}}
                                            blurOnSubmit={false}
                                        />
                                    </View>
                                </View>
                                <View style={buttons.submitButtonContainer}>
                                    <TouchableOpacity style={buttons.submitButton} onPress={() => handleSignUp()}>
                                        <Text style={buttons.submitButtonText}>Create Account</Text>
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