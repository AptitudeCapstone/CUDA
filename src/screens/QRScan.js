import React, {useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {backgroundColor, buttons, fonts, format} from '../style/Styles';
import {useAuth} from "../auth/UserContext";
import {RNCamera} from "react-native-camera";
import QRCodeScanner from "react-native-qrcode-scanner";
import ActionBar from "../navigation/ActionBar";

const QRScan = ({navigation}) => {
    // text field values
    const userInfo = useAuth(),
        auth = userInfo.userAuth,
        organization = userInfo.user?.organization;

    const processScan = (scanData) => {
        //Alert.alert('Setting patient to ', e.data);

        navigation.goBack();

    }

    return (
        <SafeAreaView style={[{flexGrow: 1, backgroundColor: backgroundColor, alignContent: 'flex-start'}]}>
            <Text style={[fonts.bigText, {paddingVertical: 25, paddingHorizontal: 25}]}>Scan a patient QR code</Text>
            <View style={{flex: 1}}>
                <View style={{flexGrow: 0.5}}>
                    <QRCodeScanner
                        style={{borderRadius: 10}}
                        onRead={(readEvent) => processScan(readEvent.data)}
                        flashMode={RNCamera.Constants.FlashMode.auto}
                    />
                </View>
            </View>
            <ActionBar navigation={navigation}/>
        </SafeAreaView>
    );
}

export default QRScan;