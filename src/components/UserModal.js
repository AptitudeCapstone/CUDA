import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Text, TouchableOpacity, View, Image, useWindowDimensions} from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {fonts, format, icons} from '../style/style';
import {useUserAuth} from '../contexts/UserContext';
import auth from "@react-native-firebase/auth";
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import RBSheet from 'react-native-raw-bottom-sheet';
import {ScrollView} from "react-native-gesture-handler";


export const UserPageHeader = () => {
    const userInfo = useUserAuth();
    const modalRef = useRef(null);
    const window = useWindowDimensions();

        const handleLogInGoogle = async () => {
            try {
                console.log('attempting to log in with google');
                await logInGoogle();
                //setUserWindowVisible(false);
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        }

        const logInGoogle = async () => {
            GoogleSignin.configure({
                webClientId: "141405103878-rsc5n2819h3b7fors0u0oadthfv4dmde.apps.googleusercontent.com",
            });

            try {
                await GoogleSignin.hasPlayServices();
                const {idToken} = await GoogleSignin.signIn();
                const credential = auth.GoogleAuthProvider.credential(idToken);
                userInfo.userAuth.linkWithCredential(credential)
                    .catch(() => {
                        auth().signInWithCredential(credential);
                    });
                return true;
            } catch (error) {
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    return true;
                } else if (error.code === statusCodes.IN_PROGRESS) {
                    return true;
                } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    throw new Error('Google play services are unavailable, try another login method.');
                }
            }
        }

        //  log out the current user
        const logOut = async () => {
            //setUserWindowVisible(false);
            GoogleSignin.signOut()
                .then(() => {
                    auth().signOut()
                        .catch(() => {
                            console.error('Error signing out');
                        });
                }).catch(err => {
                auth().signOut()
                    .catch(() => {
                        console.error('Error signing out');
                    });
            });
        }

        const disconnectFromOrganization = () => {
            userInfo.userData.ref.update({organization: null})
                .then(() => {
                    //setOrgWindowVisible(false);
                    Alert.alert('Disconnect Successful', 'Data is no longer being synced');
                }).catch(() => {
                Alert.alert('Error', 'A problem was encountered while disconnecting');
            });
        }

        const toggleUserWindow = () => {
            //setOrgWindowVisible(false);
            //setUserWindowVisible(!userWindowVisible);
        }

        const toggleOrgWindow = () => {
            //setUserWindowVisible(false);
            //setOrgWindowVisible(!orgWindowVisible);
        }

        const signIn = ({navigation}) => {
            //setUserWindowVisible(false);
            navigation.navigate('Sign In');
        }

        const createAccount = ({navigation}) => {
            //setUserWindowVisible(false);
            navigation.navigate('Create Account');
        }

        const editAccount = ({navigation}) => {
            //setUserWindowVisible(false);
            navigation.navigate('Edit Account');
        }

        const navConnectOrganization = ({navigation}) => {
            //setOrgWindowVisible(false);
            navigation.navigate('Connect Organization');
        }

        const navCreateOrganization = ({navigation}) => {
            //setOrgWindowVisible(false);
            navigation.navigate('Create Organization');
        }

    return (
        <View>
            <View style={format.pageHeader}>
                <View style={{flexDirection: 'row', paddingTop: 12}}>
                    <View>
                        <Image style={{flex: 0.75,  aspectRatio: 1,  height: null, resizeMode: 'contain', width: null,}}
                               resizeMode="contain"
                               source={require('../logo-better.png')} />
                    </View>
                    <Text style={[fonts.username, {paddingLeft: 20, paddingBottom: 12, color: '#eee'}]}>Aptitude Medical Systems</Text>
                </View>
                {
                    (userInfo.userData.status === 'anonymous-signed-in') &&
                    <TouchableOpacity style={format.iconButton} onPress={() => modalRef.current?.open()}>
                        <Text style={fonts.iconButtonText}>My Account</Text>
                        <IconFA style={fonts.iconButtonIcon} name='user-md' size={28}/>
                    </TouchableOpacity>
                }
                {
                    (userInfo.userData.status === 'registered-user-signed-in') &&
                    <TouchableOpacity style={format.iconButton} onPress={() => modalRef.current?.open()}>
                        <Text style={fonts.iconButtonText}>Signed in as {userInfo.user?.displayName}</Text>
                        <IconFA style={fonts.iconButtonIcon} name='user-md' size={28}/>
                    </TouchableOpacity>
                }
                {
                    (userInfo.userData.status !== 'anonymous-signed-in' && userInfo.userData.status !== 'registered-user-signed-in') &&
                    <Text style={{margin: 15, marginBottom: 5}}>
                        <ActivityIndicator size={34}/>
                    </Text>
                }
            </View>
            <RBSheet
                ref={modalRef}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)'
                    },
                    draggableIcon: {
                        backgroundColor: '#000'
                    },
                    container: {
                        borderTopRightRadius: 25,
                        borderTopLeftRadius: 25,
                        padding: 15,
                        backgroundColor: '#131313',
                        borderTopColor: '#555',
                        borderLeftColor: '#555',
                        borderRightColor: '#555',
                        borderTopWidth: 1,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        alignSelf: 'center',
                        width: '90%'
                    }
                }}
            >
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <ScrollView style={{flex: 0.5}}>
                    <Text style={[fonts.username, {alignSelf: 'center', marginBottom: 20, color: '#eee'}]}>Manage Account</Text>
                        {
                            (userInfo.userData.status === 'registered-user-signed-in') &&
                            <View>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={editAccount}>
                                    <Text style={fonts.iconButtonText}>Edit my account</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={logOut}>
                                    <Text style={fonts.iconButtonText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {
                            (userInfo.userData.status === 'anonymous-signed-in') &&
                            <View>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={handleLogInGoogle}>
                                    <Text style={fonts.iconButtonText}>Sign in with Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={signIn}>
                                    <Text style={fonts.iconButtonText}>Sign in with Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={createAccount}>
                                    <Text style={fonts.iconButtonText}>Create Account</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        </ScrollView>
                        <ScrollView style={{flex: 0.5}}>
                    <Text style={[fonts.username, {alignSelf: 'center', marginBottom: 20, color: '#eee'}]}>Manage Organization</Text>
                        {
                            (!(userInfo.user?.organization === null || userInfo.user?.organization === undefined)) &&
                            <View>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={disconnectFromOrganization}>
                                    <Text style={fonts.iconButtonText}>Disconnect from current organization</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {
                            (userInfo.user?.organization === null || userInfo.user?.organization === undefined) &&
                            <View>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={navConnectOrganization}>
                                    <Text style={fonts.iconButtonText}>Connect to existing</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={navCreateOrganization}>
                                    <Text style={fonts.iconButtonText}>Create new</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        </ScrollView>
                    </View>
                </View>
            </RBSheet>
        </View>
    );
}