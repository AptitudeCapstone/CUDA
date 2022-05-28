import React, {useState} from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {buttons, fonts, format, rbSheetStyle} from "../../style/Styles";
import {ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {disconnectFromOrganization} from "../../auth/Auth";
import useAuth from "../../auth/UserContext";
import database from "@react-native-firebase/database";

export const Organization = ({modalRef}) => {
    const userInfo = useAuth(),
        organization = userInfo.user?.organization,
        dimensions = useWindowDimensions(),
        [addCode, setAddCode] = useState(-1),
        [connectAddCode, setConnectAddCode] = useState(-1),
        [name, setName] = useState(''),
        [ownerEmail1, setOwnerEmail1] = useState(''),
        [ownerEmail2, setOwnerEmail2] = useState(''),
        [ownerEmail3, setOwnerEmail3] = useState(''),
        [streetAddress1, setStreetAddress1] = useState(''),
        [streetAddress2, setStreetAddress2] = useState(''),
        [city, setCity] = useState(''),
        [state, setState] = useState(''),
        [country, setCountry] = useState(''),
        [zip, setZip] = useState(0);

    const editAccount = () => {
        modalRef.current.close();
    }

    const disconnect = async () => {
        let name = 'organization';

        await database().ref('organizations/' + organization)
            .once('value')
            .then((organizationSnapshot) => {
                if (organizationSnapshot.exists())
                    name = organizationSnapshot.val()['name'];
            });
        await disconnectFromOrganization(userInfo);
        Alert.alert('Success', 'You are now disconnected from ' + name);
    }

    const handleConnectOrganization = async () => {
        try {
            await connectOrganization(connectAddCode);
            let name = 'organization';
            await database().ref('organizations/' + organization)
                .once('value')
                .then((organizationSnapshot) => {
                    if (organizationSnapshot.exists())
                        name = organizationSnapshot.val()['name'];
                });
            Alert.alert('Success', 'You are now disconnected to ' + name);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const connectOrganization = async (connectAddCode) => {
        // transaction to search org with add code, create user associated with that org
        if (connectAddCode >= 0 && connectAddCode.toString().length >= 4) {
            database().ref('organizations/')
                .orderByChild('addCode').equalTo(connectAddCode)
                .once('value',
                    (snapshot) => {
                        if (snapshot.exists()) {
                            snapshot.forEach((organization) => {
                                // organization with add code exists
                                userInfo.userData.ref.update({
                                    organization: organization.key
                                }).then(() => {
                                    Alert.alert('Success', 'Synced with ' + organization.val().name)
                                    modalRef.current?.close();
                                });
                            })
                        } else {
                            Alert.alert('No organization found', 'Please re-enter your add code');
                        }
                    }).catch(() => {
                Alert.alert('No organization found', 'Please re-enter your add code');
            });
        } else {
            throw new Error('Please enter a valid add code');
        }
    };

    const registerOrganization = () => {
        if (name !== '' && (connectAddCode === 0 || connectAddCode >= 1000) && ownerEmail1 !== '') {
            const newOrganization = database().ref('/organizations').push();
            newOrganization.set({
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
            }).then(() => {
                userInfo.userData.ref.update({
                    organization: organization.key
                }).then(() => {
                    Alert.alert('Success', 'Synced with ' + organization.val().name)
                    modalRef.current?.close();
                }).catch((error) => {
                    Alert.alert('Error', error.message);
                })
            }).catch((error) => {
                Alert.alert('Error', error.message);
            });
        } else Alert.alert('Error', 'Please complete the required fields');
    };

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <ScrollView>
                {
                    (!organization)
                        ? <>
                            <View style={{paddingTop: 20}}>
                                <Text style={fonts.smallText}>
                                    Organizations make it possible to sync data with any number of other people and devices. Connect
                                    using an add code, or create one with just a small amount of information.
                                </Text>
                            </View>
                            <View style={{alignItems: 'center', paddingTop: 30, paddingBottom: 10, paddingHorizontal: 40,}}>
                                <Text style={fonts.mediumText}>Sync to existing</Text>
                            </View>
                            <Text style={[fonts.mediumText, format.fieldName]}>Organization add code *</Text>
                            <TextInput style={format.textBox}
                                       underlineColorAndroid='transparent'
                                       placeholder='At least 4 digits'
                                       placeholderTextColor='#aaa'
                                       keyboardType='numeric'
                                       onChangeText={(code) => setConnectAddCode(code)}
                                       numberOfLines={1}
                                       multiline={false}
                                       maxLength={8}
                                       blurOnSubmit={false}/>
                            <TouchableOpacity style={buttons.submitButton}
                                              onPress={() => handleConnectOrganization()}>
                                <Text style={buttons.submitButtonText}>Connect and Sync</Text>
                            </TouchableOpacity>
                            <View>
                                <View style={{alignItems: 'center', paddingTop: 30, paddingBottom: 10, paddingHorizontal: 40,}}>
                                    <Text style={[fonts.mediumText, format.fieldName]}>
                                        Create new and sync
                                    </Text>
                                </View>
                                <Text style={[fonts.mediumText, format.fieldName]}>Name *</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Name *'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(newName) => setName(newName)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </View>
                            <View>
                                <Text style={[fonts.mediumText, format.fieldName]}>Add Code *</Text>
                                <Text style={fonts.smallText}>This unique code is used for apps to connect to this
                                    organization</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='4+ digits *'
                                           placeholderTextColor='#aaa'
                                           keyboardType='numeric'
                                           onChangeText={(code) => setAddCode(code)}
                                           numberOfLines={1}
                                           maxLength={8}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </View>
                            <View>
                                <Text style={[fonts.mediumText, format.fieldName]}>Recovery Email(s)</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Email address 1 *'
                                           placeholderTextColor='#aaa'
                                           keyboardType='email-address'
                                           onChangeText={(ownerEmail) => setOwnerEmail1(ownerEmail)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Email address 2'
                                           placeholderTextColor='#aaa'
                                           keyboardType='email-address'
                                           onChangeText={(ownerEmail) => setOwnerEmail2(ownerEmail)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Email address 3'
                                           placeholderTextColor='#aaa'
                                           keyboardType='email-address'
                                           onChangeText={(ownerEmail) => setOwnerEmail3(ownerEmail)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </View>
                            <View>
                                <Text style={[fonts.mediumText, format.fieldName]}>Address</Text>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Address line 1'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(newStreetAddress1) => setStreetAddress1(newStreetAddress1)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Address line 2 (e.g. Apt. #1)'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(newStreetAddress2) => setStreetAddress2(newStreetAddress2)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='City'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(newCity) => setCity(newCity)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='State'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(newState) => setState(newState)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='Country'
                                           placeholderTextColor='#aaa'
                                           keyboardType='default'
                                           onChangeText={(newCountry) => setCountry(newCountry)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                                <TextInput underlineColorAndroid='transparent'
                                           placeholder='5-digit zip code'
                                           placeholderTextColor='#aaa'
                                           keyboardType='numeric'
                                           onChangeText={(newZip) => setZip(newZip)}
                                           numberOfLines={1}
                                           multiline={false}
                                           style={format.textBox}
                                           blurOnSubmit={false}/>
                            </View>
                            <TouchableOpacity style={buttons.submitButton}
                                              onPress={() => registerOrganization()}>
                                <Text style={buttons.submitButtonText}>Create Organization</Text>
                            </TouchableOpacity>

                        </> : <>

                        </>
                }

                {
                    (userInfo.loginStatus === 'registered')
                        ? <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => editAccount()}>
                                <Text style={fonts.mediumText}>Edit my account</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => disconnect()}>
                                <Text style={fonts.mediumText}>Disconnect from organization</Text>
                            </TouchableOpacity>
                        </View> : null
                }
                {
                    (userInfo.loginStatus === 'loading' || userInfo.loginStatus === 'signed-out')
                        ? <ActivityIndicator style={{padding: 15}} size={'large'}/>
                        : null
                }
            </ScrollView>
        </RBSheet>);
}