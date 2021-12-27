import React from 'react';
import {Alert, SafeAreaView, StyleSheet} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';

export const ScanQR = ({navigation}) => {
    let setPatientID = e => {
        //console.log('QR scanned, patientID = ' + e.data);
        if (e.data == null) {
            navigation.navigate('Home');
            Alert.alert('No QR code found.');
        } else
            navigation.navigate('Diagnostic', {navigation, patientID: e.data});
    }

    return (
        <SafeAreaView style={styles.page}>
            <QRCodeScanner
                onRead={setPatientID}
                flashMode={RNCamera.Constants.FlashMode.auto}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-around'
    },
    section: {
        flexDirection: 'row',
    },
    text: {
        fontSize: 14,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
    },
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777'
    },
    textBold: {
        fontWeight: '500',
        color: '#000'
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
        padding: 16
    }
});