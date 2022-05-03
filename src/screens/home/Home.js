import React, {useContext, useEffect, useState} from 'react';
import {Alert, SafeAreaView, Text, TouchableOpacity, View,} from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {fonts, format, icons} from '../../style/style';
import {useUserAuth} from '../../contexts/UserContext';

export const Home = ({route, navigation}) => {
    const {
        user,
        userInfo,
        orgInfo,
        logOut,
        logInGoogle,
        disconnectFromOrganization
    } = useUserAuth();

    const [userWindowVisible, setUserWindowVisible] = useState(false);
    const [orgWindowVisible, setOrgWindowVisible] = useState(false);

    const handleLogInGoogle = async () => {
        try {
            console.log('attempting to log in with google');
            await logInGoogle();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const handleLogOut = async () => {
        try {
            await logOut();
            setUserWindowVisible(false);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const handleDisconnectFromOrganization = async () => {
        try {
            await disconnectFromOrganization();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    const toggleUserWindow = () => {
        // close other window before opening
        if (orgWindowVisible) {
            setOrgWindowVisible(false);
        }

        setUserWindowVisible(!userWindowVisible);
    }

    const toggleOrgWindow = () => {
        // close other window before opening
        if (userWindowVisible) {
            setUserWindowVisible(false);
        }

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
        navigation.navigate('Edit Account');
    }

    const navConnectOrganization = () => {
        navigation.navigate('Connect Organization')
    }

    const navCreateOrganization = () => {
        navigation.navigate('Create Organization')
    }

    const UserButtons = () => {
        if (userWindowVisible) {
            if (user != null && !user.isAnonymous)
                return (
                    <View>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={editAccount}>
                            <Text style={fonts.mediumLink}>Edit Account</Text>
                            <IconA style={icons.linkIcon} name='edit' size={20}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={handleLogOut}>
                            <Text style={fonts.mediumLink}>Logout</Text>
                            <IconMI style={icons.linkIcon} name='logout' size={20}/>
                        </TouchableOpacity>
                    </View>
                );
            else return (
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
        } else return <View/>;
    }

    const UserBar = () => {
        if (user && user.isAnonymous)
            return (
                <TouchableOpacity style={format.horizontalBar} onPress={toggleUserWindow}>
                    <Text style={fonts.username}>
                        Guest <IconE name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={34}/>
                    </Text>
                </TouchableOpacity>
            );
        else if(user)
            return (
                <TouchableOpacity style={format.horizontalBar} onPress={toggleUserWindow}>
                    <Text style={fonts.username}>
                        {userInfo && userInfo.displayName} <IconE name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={34}/>
                    </Text>
                </TouchableOpacity>
            );
        else
            return <View />;
    }

    const OrganizationWindow = () => {
        if (orgWindowVisible) {
            if (orgInfo === null)
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
                        <View style={format.horizontalSubBar}>
                            <Text style={fonts.mediumLink}>Add code: {orgInfo.addCode}</Text>
                        </View>
                        <TouchableOpacity style={format.horizontalSubBar} onPress={handleDisconnectFromOrganization}>
                            <Text style={fonts.mediumLink}>
                                Disconnect from {orgInfo.name} <IconMCI name='database-minus' size={24} />
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
        } else
            return <View/>;
    }

    const OrganizationBar = () => {
        if (orgInfo === null)
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