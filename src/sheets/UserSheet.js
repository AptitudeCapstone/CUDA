import React from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {fonts, format, rbSheetStyle} from "../style/Styles";
import {ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {disconnectFromOrganization, handleLogInGoogle, logOut} from "../auth/Auth";
import useAuth from "../auth/UserContext";

export const UserSheet = ({navigation, modalRef}) => {
    const userInfo = useAuth()
    const dimensions = useWindowDimensions();
    const isLandscape = (dimensions.width > dimensions.height);

    const signIn = () => {
        modalRef.current.close();
        navigation.navigate('User stack', {screen: 'Sign in'});
    }

    const createAccount = () => {
        modalRef.current.close();
        navigation.navigate('User stack', {screen: 'Create Account'});
    }

    const editAccount = () => {
        modalRef.current.close();
        navigation.navigate('User stack', {screen: 'Edit account'});
    }

    const navConnectOrganization = () => {
        modalRef.current.close();
        navigation.navigate('User stack', {screen: 'Connect organization'});
    }

    const navCreateOrganization = () => {
        modalRef.current.close();
        navigation.navigate('User stack', {screen: 'Create organization'});
    }

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
        <View style={isLandscape ? {flexDirection: 'row', flex: 1} : {flexDirection: 'column', flex: 1}}>
            <View style={{flex: 1}}>
                <Text style={[fonts.bigText, {alignSelf: 'center', paddingBottom: 20}]}>
                    Manage Account
                </Text>
                <ScrollView style={{flex: 0.5}}>
                    {
                        (userInfo.loginStatus === 'registered') &&
                        <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => editAccount()}>
                                <Text style={fonts.mediumText}>Edit my account</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => logOut()}>
                                <Text style={fonts.mediumText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {
                        (userInfo.loginStatus === 'guest') &&
                        <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={handleLogInGoogle(userInfo)}>
                                <Text style={fonts.mediumText}>Sign in with Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => signIn()}>
                                <Text style={fonts.mediumText}>Sign in with Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={() => createAccount()}>
                                <Text style={fonts.mediumText}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {
                        (userInfo.loginStatus === 'loading' || userInfo.loginStatus === 'signed-out') &&
                        <ActivityIndicator style={{padding: 15}} size={'large'}/>
                    }
                </ScrollView>
            </View>
            <View style={isLandscape ? {flex: 1} : {flex: 1, marginTop: 20}}>
                <Text style={[fonts.bigText, {alignSelf: 'center', paddingBottom: 20, color: '#eee'}]}>
                    Manage Organization
                </Text>
                <ScrollView style={{flex: 0.5}}>
                    {
                        (!(userInfo.user?.organization === null || userInfo.user?.organization === undefined)) &&
                        <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={() => disconnectFromOrganization(userInfo)}>
                                <Text style={fonts.iconButtonText}>Disconnect from current organization</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {
                        (userInfo.user?.organization === null || userInfo.user?.organization === undefined) &&
                        <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={() => navConnectOrganization()}>
                                <Text style={fonts.iconButtonText}>Connect to existing</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={() => navCreateOrganization()}>
                                <Text style={fonts.iconButtonText}>Create new</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </ScrollView>
            </View>
        </View>
    </RBSheet>);
}