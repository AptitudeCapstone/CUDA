import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import {useUserAuth} from "../../contexts/UserContext";

export const CreateAccount = ({navigation, route}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {signUp} = useUserAuth();

    const handleSignUp = async () => {
        try {
            console.log('attempting to log in with google');
            await signUp(name, email, password);
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