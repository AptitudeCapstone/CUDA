import React, {useRef} from 'react';
import {ActivityIndicator, Alert, Text, TouchableOpacity, View} from 'react-native';
import IconFA from 'react-native-vector-icons/FontAwesome';
import {fonts, format, icons} from '../style';
import {useAuth} from '../contexts/UserContext';
import auth from "@react-native-firebase/auth";
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import RBSheet from 'react-native-raw-bottom-sheet';
import {ScrollView} from "react-native-gesture-handler";
import FastImage from 'react-native-fast-image';

const HeaderBar = ({navigation}) => {
    const userInfo = useAuth();
    const modalRef = useRef(null);

    const handleLogInGoogle = async () => {
        try {
            console.log('attempting to log in with google');
            await logInGoogle();
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

    const logOut = async () => {
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
                Alert.alert('Disconnect Successful', 'Data is no longer being synced');
            }).catch(() => {
            Alert.alert('Error', 'A problem was encountered while disconnecting');
        });
    }

    const signIn = () => {
        modalRef.current.close();
        navigation.navigate('User Stack', {screen: 'Sign in'});
    }

    const createAccount = () => {
        modalRef.current.close();
        navigation.navigate('User Stack', {screen: 'Create Account'});
    }

    const editAccount = () => {
        modalRef.current.close();
        navigation.navigate('User Stack', {screen: 'Edit Account'});
    }

    const navConnectOrganization = () => {
        modalRef.current.close();
        navigation.navigate('User Stack', {screen: 'Connect Organization'});
    }

    const navCreateOrganization = () => {
        modalRef.current.close();
        navigation.navigate('User Stack', {screen: 'Create Organization'});
    }

    return (
        <View>
            <View style={format.pageHeader}>
                <View style={{flexDirection: 'row', paddingTop: 12}}>
                    <View>
                        <FastImage style={{flex: 0.75,  aspectRatio: 1,  height: null, resizeMode: 'contain', width: null,}}
                               resizeMode="contain"
                               source={require('../resources/aptitude-logo.png')} />
                    </View>
                </View>
                <TouchableOpacity style={format.iconButton} onPress={() => modalRef.current?.open()}>
                    <Text style={fonts.iconButtonText}>Usage Guide</Text>
                </TouchableOpacity>
                {
                    (userInfo.loginStatus === 'guest') &&
                    <TouchableOpacity style={format.iconButton} onPress={() => modalRef.current?.open()}>
                        <Text style={fonts.iconButtonText}>My Account</Text>
                        <IconFA style={fonts.iconButtonIcon} name='user-md' size={28}/>
                    </TouchableOpacity>
                }
                {
                    (userInfo.loginStatus === 'registered-user') &&
                    <TouchableOpacity style={format.iconButton} onPress={() => modalRef.current?.open()}>
                        <Text style={fonts.iconButtonText}>Signed in as {userInfo.user?.displayName}</Text>
                        <IconFA style={fonts.iconButtonIcon} name='user-md' size={28}/>
                    </TouchableOpacity>
                }
                {
                    (userInfo.loginStatus !== 'guest' && userInfo.loginStatus !== 'registered-user') &&
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
                            (userInfo.loginStatus === 'registered-user') &&
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
                            (userInfo.loginStatus === 'guest') &&
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
                        {
                            (userInfo.loginStatus === 'loading' || userInfo.loginStatus === 'signed-out') &&
                            <ActivityIndicator style={{padding: 15}} size={'large'} />
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

export default HeaderBar;