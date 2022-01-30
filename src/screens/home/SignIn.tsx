import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {buttons, fonts, format} from '../../style/style';

export const SignIn = ({navigation, route}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const sign_in = () => {
        const credential = auth.EmailAuthProvider.credential(email, password);
        auth().currentUser.linkWithCredential(credential).then(r => {
            Alert.alert('Signed In', 'You have been successfully signed in');
            navigation.navigate('Home');
        }).catch(error => {
            if (error.code === 'auth/wrong-password')
                Alert.alert('Error', 'Password is incorrect');
            else if (error.code === 'user-not-found')
                Alert.alert('Error', 'Account was not found with that email');
            else {
                auth().signInWithCredential(credential).then(r => {
                    // account exists, merge data to account and delete old user
                    // TO DO...

                    Alert.alert('Signed In', 'You have been successfully signed in');
                    navigation.navigate('Home');
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
                        onPress={sign_in}
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