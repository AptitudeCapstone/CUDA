import React, {useState} from 'react';
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {buttons, fonts, format} from '../../style/style';


export const StartTest = ({navigation, route}) => {
    const [value, setValue] = useState(null);

    const [selectedTest, setSelectedTest] = useState('COVID');
    const [patientKey, setPatientId] = useState(null);

    /*

        COVID/FIBRINOGEN SELECTION BAR

     */

    const TestSelectBar = () => {
        return (
            <View style={format.testSelectBar}>
                <TouchableOpacity
                    style={(selectedTest == 'COVID') ? buttons.covidSelectButton : buttons.unselectedButton}
                    onPress={() => setSelectedTest('COVID')}
                >
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(selectedTest == 'Fibrinogen') ? buttons.fibrinogenSelectButton : buttons.unselectedButton}
                    onPress={() => setSelectedTest('Fibrinogen')}
                >
                    <Text style={fonts.selectButtonText}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /*

        LOG A TEST RESULT

     */

    const log_result = () => {

    }

    return (
        <SafeAreaView style={format.page}>
            <TestSelectBar />
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View>
                    <Text style={fonts.heading}>Start a Test</Text>
                    <Text style={fonts.subheading}>Result Value</Text>
                    <View style={format.textBox}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Value'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(value) => setValue(value)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 20, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={log_result}
                    >
                        <Text style={buttons.submitButtonText}>Record Result</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}