import React, {Alert, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from '@react-native-firebase/database';

export const CreateOrganization = ({navigation}) => {
    const [name, setName] = useState('');
    const [addCode, setAddCode] = useState(-1);
    const [ownerEmail1, setOwnerEmail1] = useState('');
    const [ownerEmail2, setOwnerEmail2] = useState('');
    const [ownerEmail3, setOwnerEmail3] = useState('');
    const [streetAddress1, setStreetAddress1] = useState('');
    const [streetAddress2, setStreetAddress2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [zip, setZip] = useState(0);

    const register_organization = () => {
        if (name != '' && (addCode == 0 || addCode >= 1000) && ownerEmail1 != '') {
            const newReference = database().ref('/organizations').push();
            const orgID = newReference.key;

            newReference
                .set({
                    name: name,
                    addCode: addCode,
                    ownerEmail1: ownerEmail1,
                    ownerEmail2: ownerEmail2,
                    ownerEmail3: ownerEmail3,
                    streetAddress1: streetAddress1,
                    streetAddress2: streetAddress2,
                    city: city,
                    state: state,
                    country: country,
                    zip: zip
                })
                .then(() => console.log('Set /organizations/' + orgID +
                    ' to name: ' + name +
                    ', addCode: ' + addCode +
                    ', ownerEmail1: ' + ownerEmail1 +
                    ', ownerEmail2: ' + ownerEmail2 +
                    ', ownerEmail3: ' + ownerEmail3 +
                    ', streetAddress1: ' + streetAddress1 +
                    ', streetAddress2: ' + streetAddress2 +
                    ', city: ' + city +
                    ', state: ' + state +
                    ', country: ' + country +
                    ', zip: ' + zip));
        } else
            Alert.alert('Please complete the required fields');
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
                    <Text style={styles.headingText}>Name *</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Name *'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(newName) => setName(newName)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.altHeadingText}>Add Code *</Text>
                    <Text style={styles.subheadingText}>This unique code is used for apps to connect to this
                        organization</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='4+ digits *'
                            placeholderTextColor='#bbb'
                            keyboardType='numeric'
                            onChangeText={(newAddCode) => setAddCode(newAddCode)}
                            numberOfLines={1}
                            maxLength={8}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.headingText}>Recovery Email(s)</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Email address 1 *'
                            placeholderTextColor='#bbb'
                            keyboardType='email-address'
                            onChangeText={(ownerEmail) => setOwnerEmail1(ownerEmail)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Email address 2'
                            placeholderTextColor='#bbb'
                            keyboardType='email-address'
                            onChangeText={(ownerEmail) => setOwnerEmail2(ownerEmail)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Email address 3'
                            placeholderTextColor='#bbb'
                            keyboardType='email-address'
                            onChangeText={(ownerEmail) => setOwnerEmail3(ownerEmail)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.headingText}>Address</Text>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Address line 1'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(newStreetAddress1) => setStreetAddress1(newStreetAddress1)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Address line 2 (e.g. Apt. #1)'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(newStreetAddress2) => setStreetAddress2(newStreetAddress2)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='City'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(newCity) => setCity(newCity)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='State'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(newState) => setState(newState)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='Country'
                            placeholderTextColor='#bbb'
                            keyboardType='default'
                            onChangeText={(newCountry) => setCountry(newCountry)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.textBoxContainer}>
                        <TextInput
                            underlineColorAndroid='transparent'
                            placeholder='5-digit zip code'
                            placeholderTextColor='#bbb'
                            keyboardType='numeric'
                            onChangeText={(newZip) => setZip(newZip)}
                            numberOfLines={1}
                            multiline={false}
                            style={{padding: 25, color: '#fff'}}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>
                <View style={styles.testButtonContainer}>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={register_organization}
                    >
                        <Text style={styles.testButtonText}>Create Organization</Text>
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