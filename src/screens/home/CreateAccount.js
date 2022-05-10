import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import {useUserAuth} from "../../contexts/UserContext";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";

export const CreateAccount = ({navigation, route}) => {
    const userInfo = useUserAuth();
    const userAuth = userInfo.userAuth;
    const userStatus = userInfo.user.status;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        try {
            console.log('Attempting to sign up');
            await signUp(name, email, password);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    //  sign up via name, email password
    //      sets the user profile with desired name and
    //      then create user entry in database


    // potential problem: use credential user ref or one from context?

    const signUp = async (name, email, password) => {
        //  * we assume this page is reached by an anonymous account *
        //  * this is because we create a guest account when         *
        //  * the user has not create an account or logged in        *
        if(userStatus !== 'anonymous-signed-in') {
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
                    <Text style={fonts.heading}>New Account</Text>
                    <Text style={fonts.subheading}>Name</Text>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Name'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(name) => setName(name)}
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
                            onChangeText={(email) => setEmail(email)}
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
                            onChangeText={(password) => setPassword(password)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 20, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity style={buttons.submitButton} onPress={handleSignUp}>
                        <Text style={buttons.submitButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}