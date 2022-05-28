import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {Alert, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format, rbSheetStyle} from '../../style/Styles';
import {useAuth} from "../../auth/UserContext";
import database from "@react-native-firebase/database";

const ConnectOrganization = ({modalRef}) => {
    const userInfo = useAuth(),
        [addCode, setAddCode] = useState(-1),
        dimensions = useWindowDimensions();

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
                            snapshot.forEach((organization) => {
                                // organization with add code exists
                                userInfo.userData.ref.update({
                                    organization: organization.key
                                }).then(() => {
                                    Alert.alert('Success', 'Synced with ' + organization.val().name)
                                    modalRef.current?.close();
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
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <KeyboardAwareScrollView extraScrollHeight={150} style={{paddingTop: 40, paddingBottom: 40}}>
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
                            blurOnSubmit={false}/>
                    </View>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={() => handleConnectOrganization()}>
                        <Text style={buttons.submitButtonText}>Connect and Sync</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </RBSheet>
    );
}

export default ConnectOrganization;