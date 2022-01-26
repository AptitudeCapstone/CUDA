import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {fonts, format, icons, buttons} from '../style/style';

export const SignIn = ({navigation, route}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const sign_in = () => {
        auth().signInWithEmailAndPassword(email, password).then(r => {
            Alert.alert('Signed In', 'You have been successfully signed in');
            navigation.navigate('Home');
        }).catch(error => {
            if(error.code === 'auth/wrong-password')
                Alert.alert('Error', 'Password is incorrect');
            else if(error.code === 'user-not-found')
                Alert.alert('Error', 'Account was not found with that email');
        });
    }

    return (
        <SafeAreaView style={format.page}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    backgroundColor: '#333',
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Email address'
                            placeholderTextColor='#555'
                            keyboardType='email-address'
                            onChangeText={(email) => setEmail(email)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 15, color: '#333'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Password'
                            placeholderTextColor='#555'
                            onChangeText={(password) => setPassword(password)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 15, color: '#333'}}
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
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}