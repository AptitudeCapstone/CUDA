import React, {useState} from 'react';
import {Keyboard, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import SubmitButton from '../components/SubmitButton';
import TextInputField from '../components/TextInputField';
import {openDatabase} from 'react-native-sqlite-storage';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const QRCodes = ({navigation}) => {
    let [numberOfCodes, setNumberOfCodes] = useState('');

    let make_pdf = () => {

    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={styles.page}>
                <View style={{alignItems: 'center', backgroundColor: '#222'}}>

                    <View style={styles.section}>
                        <Text style={styles.headingText}>Number of Codes</Text>
                        <TextInputField
                            placeholder='Enter number'
                            keyboardType="numeric"
                            onChangeText={
                                (numCodes) => setNumberOfCodes(numCodes)
                            }
                            style={{padding: 25}}
                        />
                    </View>
                    <View style={styles.section}>
                        <View style={{marginTop: 45}}>
                            <SubmitButton title='Generate Codes' customClick={make_pdf}/>
                        </View>
                    </View>
                    {/*<QRCode value='1' />
                    <QRCode value='2' />*/}
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'column',
    },
    headingText: {
        margin: 40,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});