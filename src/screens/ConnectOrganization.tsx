import React, {useState} from 'react';
import {Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from '@react-native-firebase/database';

export const ConnectOrganization = ({navigation}) => {
    const [name, setName] = useState('');
    const [addCode, setAddCode] = useState(-1);

    const connect_organization = () => {
        // transaction to search org with add code, create user associated with that org
        if(addCode >= 0) {
            database().ref('organizations/').orderByChild('addCode').equalTo('111111').once('value', function(snapshot) {
                if(snapshot.val()) {
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
                                    }).catch(error => {
                                        console.log(error);
                                    }),
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
            //verify that org with add code exists
            Alert.alert('Please enter a valid add code');
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    backgroundColor: '#222',
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View style={styles.section}>
                    <Text style={styles.altHeadingText}>Add Code *</Text>
                    <Text style={styles.subheadingText}>Enter the organization's add code</Text>
                    <View style={styles.textBoxContainer}>
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
                <View style={styles.testButtonContainer}>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={connect_organization}
                    >
                        <Text style={styles.testButtonText}>Connect and Sync</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-between',
    },
    section: {},
    textBoxContainer: {
        marginLeft: 35,
        marginRight: 35,
        marginTop: 0,
        marginBottom: 20,
        borderColor: '#eee',
        borderWidth: 1,
        borderRadius: 5
    },
    headingText: {
        margin: 20,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    altHeadingText: {
        margin: 20,
        marginBottom: 0,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    subheadingText: {
        marginTop: 0,
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#2cab5c',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        borderRadius: 50,
        marginTop: 40,
        marginBottom: 60,
    },
    testButtonText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});