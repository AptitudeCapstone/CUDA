import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {buttons, format} from '../style/style';


export const CreateAccount = ({navigation, route}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const register_user = () => {
        if (password.length >= 6) {
            auth().createUserWithEmailAndPassword(email, password).then((userCredentials) => {
                if (userCredentials.user) {
                    userCredentials.user.updateProfile({
                        displayName: name
                    }).then((s) => {
                        navigation.navigate('Sign In');
                    })
                }
            }).catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert('Error', 'That email address is already in use');
                }

                if (error.code === 'auth/invalid-email') {
                    Alert.alert('Error', 'That email address is invalid');
                }

                console.error(error);
            });
        } else {
            Alert.alert('Error', 'Please use at least 6 characters for your pasword');
        }
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
                            placeholder='Name'
                            placeholderTextColor='#333'
                            keyboardType='default'
                            onChangeText={(name) => setName(name)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 15, color: '#333'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Email address'
                            placeholderTextColor='#333'
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
                            placeholderTextColor='#333'
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
                        onPress={register_user}
                    >
                        <Text style={buttons.submitButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}