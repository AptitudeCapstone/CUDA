import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {buttons, fonts, format} from '../../style/style';
import {useUserAuth} from "../../contexts/UserContext";

export const ConnectOrganization = ({navigation}) => {
    const { connectOrganization } = useUserAuth();
    const [addCode, setAddCode] = useState(-1);

    const handleConnectOrganization = async () => {
        try {
            await connectOrganization(addCode);
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