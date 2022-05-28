import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {Alert, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import auth from "@react-native-firebase/auth";
import {buttons, fonts, format, rbSheetStyle} from '../../style/Styles';
import {useAuth} from '../../auth/UserContext';
import {AppleSocialButton, GoogleSocialButton} from "react-native-social-buttons";
import appleAuth from '@invertase/react-native-apple-authentication'
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import database from "@react-native-firebase/database";


const SignInSignUp = ({modalRef}) => {
    const userInfo = useAuth(),
        userAuth = userInfo.userAuth,
        userStatus = userInfo.user?.status,
        [email, setEmail] = useState(''),
        [password, setPassword] = useState(''),
        dimensions = useWindowDimensions(),
        [createName, setCreateName] = useState(''),
        [createEmail, setCreateEmail] = useState(''),
        [createPassword, setCreatePassword] = useState('');

    //  sign up via name, email password
    //      sets the user profile with desired name and
    //      then create user entry in database
    const handleSignUp = async () => {
        try {
            console.log('Attempting to sign up');
            await signUp(createName, createEmail, createPassword);
            modalRef.current?.close();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

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
            await logIn(email, password);
            Alert.alert('Success', 'You have been signed in');
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

    // log in using Apple credentials
    //      if an account with this credential exists, link them
    //      else, log in
    const handleLogInApple = async () => {
        try {
            await logInApple();
            Alert.alert('Success', 'You have been signed in');
            modalRef.current?.close();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    async function logInApple() {
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        if (!appleAuthRequestResponse.identityToken)
            throw new Error('Apple sign-in failed. Try another method. ');

        const { identityToken, nonce } = appleAuthRequestResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        await auth().signInWithCredential(appleCredential);
    }

    //      if an account with this credential exists, link them
    //      else, log in
    const handleLogInGoogle = async () => {
        try {
            await logInGoogle();
            Alert.alert('Success', 'You have been signed in');
            modalRef.current?.close();
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
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            userInfo.userAuth.linkWithCredential(googleCredential)
                .catch(() => {
                    auth().signInWithCredential(googleCredential);
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
            Alert.alert('A recovery email has been sent', 'Check your email to recover your account');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const sendEmail = async () => {
        await auth().sendPasswordResetEmail(email);
    }

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <ScrollView extraScrollHeight={200} style={{paddingTop: 20, paddingBottom: 60}}>
                {
                    (userInfo.loginStatus === 'guest')
                        ? <>
                            <View>
                                <View style={{alignItems: 'center', marginBottom: 30}}>
                                    <AppleSocialButton buttonViewStyle={{width: dimensions.width - 80, marginBottom: 15}} onPress={async () => await handleLogInApple()} />
                                    <GoogleSocialButton buttonViewStyle={{width: dimensions.width - 80}} onPress={async () => await handleLogInGoogle()} />
                                </View>
                                <Text style={[fonts.mediumText, format.fieldName]}>Email Address</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Email address'
                                           placeholderTextColor='#aaa'
                                           keyboardType='email-address'
                                           onChangeText={(email) => setEmail(email)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <Text style={[fonts.mediumText, format.fieldName]}>Password</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Password'
                                           placeholderTextColor='#aaa'
                                           onChangeText={(password) => setPassword(password)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </View>
                            <TouchableOpacity style={buttons.submitButton}
                                              onPress={async () => await handleLogIn()}>
                                <Text style={[buttons.submitButtonText, ]}>Sign in</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={buttons.forgotPasswordButton}
                                              onPress={async () => await handleSendEmail()}>
                                <Text style={buttons.forgotPasswordText}>Forgot your password?</Text>
                            </TouchableOpacity>
                            <View>
                                <View style={{alignItems: 'center', paddingTop: 30, paddingBottom: 10, paddingHorizontal: 40,}}>
                                    <Text style={[fonts.mediumText, format.fieldName]}>
                                        Register with email
                                    </Text>
                                </View>
                                <Text style={[fonts.mediumText, format.fieldName]}>
                                    Name
                                </Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Name'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(name) => setCreateName(name)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <Text style={[fonts.mediumText, format.fieldName]}>Email Address</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Email address'
                                           placeholderTextColor='#aaa'
                                           keyboardType='email-address'
                                           onChangeText={(email) => setCreateEmail(email)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <Text style={[fonts.mediumText, format.fieldName]}>Password</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Password (at least 6 characters)'
                                           placeholderTextColor='#aaa'
                                           onChangeText={(password) => setCreatePassword(password)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </View>
                            <TouchableOpacity style={buttons.submitButton} onPress={async () => await handleSignUp()}>
                                <Text style={buttons.submitButtonText}>Create Account</Text>
                            </TouchableOpacity>
                        </>
                        : <View style={{padding: 20}}>
                            <Text style={fonts.bigText}>There has been an error. Try restarting the app. </Text>
                        </View>
                }
            </ScrollView>
        </RBSheet>
    );
}

export default SignInSignUp;