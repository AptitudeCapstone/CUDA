import React, {Alert, useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import database from '@react-native-firebase/database';
import {buttons, fonts, format} from '../../style/style';

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
        <SafeAreaView style={format.page}>
            <KeyboardAwareScrollView
                extraScrollHeight={150}
                style={{
                    paddingTop: 40,
                    paddingBottom: 40
                }}
            >
                <View>
                    <Text style={fonts.heading}>New Organization</Text>
                    <Text style={fonts.subheading}>Name *</Text>
                    <View style={format.textBox}>
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
                <View>
                    <Text style={fonts.subheading}>Add Code *</Text>
                    <Text style={fonts.smallText}>This unique code is used for apps to connect to this
                        organization</Text>
                    <View style={format.textBox}>
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
                <View>
                    <Text style={fonts.subheading}>Recovery Email(s)</Text>
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                <View>
                    <Text style={fonts.subheading}>Address</Text>
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                    <View style={format.textBox}>
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
                <View style={buttons.submitButtonContainer}>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={register_organization}
                    >
                        <Text style={buttons.submitButtonText}>Create Organization</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}