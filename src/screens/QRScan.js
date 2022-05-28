import React, {useRef, useState} from 'react';
import {Platform, SafeAreaView, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {backgroundColor, buttons, fonts, format} from '../style/Styles';
import {useAuth} from "../auth/UserContext";
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import ActionBar from "../navigation/ActionBar";

const QRScan = ({navigation}) => {
    // text field values
    const userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization,
        camRef = useRef(null),
        dimensions = useWindowDimensions();

    const processScan = (scanData) => {
        //Alert.alert('Setting patient to ', e.data);

        navigation.goBack();

    }

    return (
        <SafeAreaView style={[{flexGrow: 1, backgroundColor: backgroundColor}]}>
                <View style={{paddingVertical: 25, paddingHorizontal: 25}}>
                    <Text style={fonts.bigText}>Scan a patient QR code</Text>
                </View>
                <View style={{flex: 1, alignContent: 'flex-start'}}>
                <QRCodeScanner
                    onRead={processScan}
                    containerStyle={{flex: 0.5, margin: 20, alignContent: 'flex-start', justifyContent: 'flex-start'}}
                    cameraContainerStyle={{borderRadius: 15, overflow: 'hidden', padding: 0, margin: 0}}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                />
                </View>
            <ActionBar navigation={navigation}/>
        </SafeAreaView>
    );
}

export default QRScan;