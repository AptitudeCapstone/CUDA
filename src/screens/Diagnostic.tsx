import React, {useState} from 'react';
import {
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import database from "@react-native-firebase/database";

export const Diagnostic = ({route, navigation}) => {
    const {patientID} = route.params;
    let [testType, setTestType] = useState('');
    let [testResult, setTestResult] = useState('');

    let add_test_result = () => {
        const testReference = database().ref('/tests').push();
        const date = new Date();
        testReference
            .set({
                name: patientID,
                type: testType,
                result: testResult,
                time: date.toISOString()
            })
            .then(() => console.log('Added entry for /tests/' + testReference.key));
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}
                                      style={{flex: 1}}
            >
                <View style={styles.page}>
                    <View style={styles.section}>
                        <View
                            style={{
                                marginLeft: 35,
                                marginRight: 35,
                                marginTop: 10,
                                marginBottom: 20,
                                borderColor: '#eee',
                                borderWidth: 1,
                                borderRadius: 5
                            }}
                        >
                            <TextInput
                                underlineColorAndroid='transparent'
                                placeholder='Enter test ID (0 or 1)'
                                placeholderTextColor='#bbb'
                                keyboardType='numeric'
                                onChangeText={(testType) => setTestType(testType)}
                                numberOfLines={1}
                                multiline={false}
                                style={{padding: 25}}
                                blurOnSubmit={false}
                            />
                        </View>
                        <View
                            style={{
                                marginLeft: 35,
                                marginRight: 35,
                                marginTop: 10,
                                marginBottom: 20,
                                borderColor: '#eee',
                                borderWidth: 1,
                                borderRadius: 5
                            }}
                        >
                            <TextInput
                                underlineColorAndroid='transparent'
                                placeholder='Enter result'
                                placeholderTextColor='#bbb'
                                keyboardType='numeric'
                                onChangeText={(testResult) => setTestResult(testResult)}
                                numberOfLines={1}
                                multiline={false}
                                style={{padding: 25}}
                                blurOnSubmit={false}
                            />
                        </View>
                        <View style={styles.testButtonContainer}>
                            <TouchableOpacity
                                onPress={add_test_result}
                                style={styles.testButton}
                            >
                                <Text style={styles.testButtonText}>Log Test Result</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    },
    navButton: {
        backgroundColor: '#444',
        padding: 20,
        alignSelf: 'stretch',
        borderBottomWidth: 2,
        borderBottomColor: '#666',
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
    },
    testButton: {
        backgroundColor: '#2cab5c',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
        marginTop: 20,
        marginBottom: 20,
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
    },
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});