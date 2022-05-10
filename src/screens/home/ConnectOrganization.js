import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import {useUserAuth} from "../../contexts/UserContext";
import database from "@react-native-firebase/database";

export const ConnectOrganization = ({navigation}) => {
    const userInfo = useUserAuth();
    const [addCode, setAddCode] = useState(-1);

    const handleConnectOrganization = async () => {
        try {
            await connectOrganization(addCode);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const connectOrganization = async (addCode) => {
        // transaction to search org with add code, create user associated with that org
        if (addCode >= 0 && addCode.toString().length >= 4) {
            database().ref('organizations/')
                .orderByChild('addCode').equalTo(addCode)
                .once('value',
                    (snapshot) => {
                        if (snapshot.exists()) {
                            snapshot.forEach((snapshot) => {
                                // organization with add code exists
                                userInfo.userData.ref.update({
                                    organization: snapshot.key
                                }).then(() => {
                                    console.log('org: ' + snapshot.val());
                                    console.debug(JSON.stringify(snapshot.val(), null, 2));
                                    Alert.alert('Success', 'Synced with ' + snapshot.val().name)
                                    navigation.navigate('Home');
                                    return true;
                                });
                            })
                        } else {
                            Alert.alert('Error', 'No organization found. Please re-enter your add code. ');
                        }
                    }).catch(() => {
                Alert.alert('Error', 'No organization found. Please re-enter your add code. ');
                    });
        } else {
            throw new Error('Please enter a valid add code');
        }
    };

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
                    <Text style={fonts.heading}>Sync Account with Organization</Text>
                    <Text style={fonts.smallText}>Enter the organization's add code *</Text>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='4+ digits *'
                            placeholderTextColor='#bbb'
                            keyboardType='numeric'
                            onChangeText={(newAddCode) => setAddCode(newAddCode)}
                            numberOfLines={1}
                            multiline={false}
                            maxLength={8}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={handleConnectOrganization}
                    >
                        <Text style={buttons.submitButtonText}>Connect and Sync</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}