import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import database from '@react-native-firebase/database';

export const ConnectOrganization = ({navigation}) => {
    const [addCode, setAddCode] = useState(-1);

    const connect_organization = () => {
        // transaction to search org with add code, create user associated with that org

        if (addCode >= 0) {
            database().ref('organizations/').orderByChild('addCode').equalTo(addCode).once('value', function (snapshot) {
                //verify that org with add code exists
                if (snapshot.val()) {
                    snapshot.forEach(function (data) {
                        Alert.alert(
                            'Organization Found',
                            'Attempting to sync data with ' + data.val().name,
                            [
                                {
                                    text: 'Continue',
                                    onPress: () => navigation.navigate('Welcome', {
                                        navigation,
                                        currentOrg: data.key,
                                        currentOrgName: data.val().name
                                    })
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                            ]
                        );
                    });
                } else {
                    Alert.alert('Error', 'No organization was found with this add code');
                }
            })
        } else {
            Alert.alert('Please enter a valid add code');
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
                        onPress={connect_organization}
                    >
                        <Text style={buttons.submitButtonText}>Connect and Sync</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}