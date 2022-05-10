import React, {useState} from 'react';
import {ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View,} from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {fonts, format, icons} from '../../style/style';
import {useUserAuth} from '../../contexts/UserContext';
import auth from "@react-native-firebase/auth";
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";

export const Home = ({route, navigation}) => {
    const userInfo = useUserAuth();

    const [userWindowVisible, setUserWindowVisible] = useState(false);
    const [orgWindowVisible, setOrgWindowVisible] = useState(false);

    const handleLogInGoogle = async () => {
        try {
            console.log('attempting to log in with google');
            await logInGoogle();
            setUserWindowVisible(false);
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
        setUserWindowVisible(false);
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
                setOrgWindowVisible(false);
                Alert.alert('Disconnect Successful', 'Data is no longer being synced');
            }).catch(() => {
                Alert.alert('Error', 'A problem was encountered while disconnecting');
            });
    }

    const toggleUserWindow = () => {
        setOrgWindowVisible(false);
        setUserWindowVisible(!userWindowVisible);
    }

    const toggleOrgWindow = () => {
        setUserWindowVisible(false);
        setOrgWindowVisible(!orgWindowVisible)
    }

    const signIn = () => {
        setUserWindowVisible(false);
        navigation.navigate('Sign In');
    }

    const createAccount = () => {
        setUserWindowVisible(false);
        navigation.navigate('Create Account');
    }

    const editAccount = () => {
        setUserWindowVisible(false);
        navigation.navigate('Edit Account');
    }

    const navConnectOrganization = () => {
        setOrgWindowVisible(false);
        navigation.navigate('Connect Organization')
    }

    const navCreateOrganization = () => {
        setOrgWindowVisible(false);
        navigation.navigate('Create Organization')
    }

    const UserButtons = () => {
        if (userWindowVisible) {
            if (userInfo.userData.status === 'registered-user-signed-in')
                return (
                    <View>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={editAccount}>
                            <Text style={fonts.mediumLink}>Edit Account</Text>
                            <IconA style={icons.linkIcon} name='edit' size={20}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={logOut}>
                            <Text style={fonts.mediumLink}>Logout</Text>
                            <IconMI style={icons.linkIcon} name='logout' size={20}/>
                        </TouchableOpacity>
                    </View>
                );
            else if(userInfo.userData.status === 'anonymous-signed-in')
                return (
                <View>
                    <TouchableOpacity style={format.horizontalSubBar} onPress={handleLogInGoogle}>
                        <Text style={fonts.mediumLink}>Sign in with Google</Text>
                        <IconI style={icons.linkIcon} name='logo-google' size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={format.horizontalSubBar} onPress={signIn}>
                        <Text style={fonts.mediumLink}>Sign in with Email</Text>
                        <IconF style={icons.linkIcon} name='user' size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={format.horizontalSubBar} onPress={createAccount}>
                        <Text style={fonts.mediumLink}>Create Account</Text>
                        <IconF style={icons.linkIcon} name='user-plus' size={20}/>
                    </TouchableOpacity>
                </View>
            );
            else return <View />;
        } else return <View />;
    }

    const UserBar = () => {
        if (userInfo.userData.status === 'anonymous-signed-in')
            return (
                <TouchableOpacity style={format.horizontalBar} onPress={toggleUserWindow}>
                    <Text style={fonts.username}>
                        Guest <IconE name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={34}/>
                    </Text>
                </TouchableOpacity>
            );
        else if (userInfo.userData.status === 'registered-user-signed-in')
            return (
                <TouchableOpacity style={format.horizontalBar} onPress={toggleUserWindow}>
                    <Text style={fonts.username}>
                        {userInfo.user?.displayName} <IconE name={userWindowVisible ? 'chevron-up' : 'chevron-down'}
                                                      size={34}/>
                    </Text>
                </TouchableOpacity>
            );
        else
            return (
                <Text style={{margin: 15, marginBottom: 5}}>
                    <ActivityIndicator size={34}/>
                </Text>
            );
    }

    const OrganizationWindow = () => {
        if (orgWindowVisible) {
            if (userInfo.user?.organization === null || userInfo.user?.organization === undefined)
                return (
                    <View>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={navConnectOrganization}>
                            <Text style={fonts.mediumLink}>
                                Connect to Organization <IconMCI name='database' size={20}/>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={navCreateOrganization}>
                            <Text style={fonts.mediumLink}>Create an Organization
                                <IconMCI name='database-plus' size={20}/>
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            else
                return (
                    <View>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={disconnectFromOrganization}>
                            <Text style={fonts.mediumLink}>
                                Disconnect from current organization <IconMCI name='database-minus' size={24} />
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
        } else
            return <View/>;
    }

    const OrganizationBar = () => {
        if (userInfo.user?.organization === null || userInfo.user?.organization === undefined)
            return (
                <TouchableOpacity style={format.horizontalBar} onPress={toggleOrgWindow}>
                    <IconMCI style={icons.smallIcon} name='database' size={30}/>
                </TouchableOpacity>
            );
        else
            return (
                <TouchableOpacity style={format.horizontalBar} onPress={toggleOrgWindow}>
                    <IconMCI style={icons.smallIcon} name='database-check' size={30}/>
                </TouchableOpacity>
            );
    }


    /*

        HOME PAGE

     */

    return (
        <SafeAreaView style={format.page}>
            <View style={format.pageHeader}>
                <UserBar/>
                <OrganizationBar/>
            </View>
            <UserButtons/>
            <OrganizationWindow/>
        </SafeAreaView>
    );
}