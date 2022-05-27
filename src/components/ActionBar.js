import React, {useRef} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import IconFA from 'react-native-vector-icons/FontAwesome';
import {floating, fonts, format, rbSheetStyle} from '../Styles';
import {useAuth} from '../contexts/UserContext';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ScrollView} from "react-native-gesture-handler";
import IconMCI from "react-native-vector-icons/MaterialCommunityIcons";
import {handleLogInGoogle} from "../auth/Common";


const ActionBar = ({navigation}) => {
    const modalRef = useRef(null);
    const userInfo = useAuth();
    const dimensions = useWindowDimensions();
    const isLandscape = (dimensions.width > dimensions.height);

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

    const UserSheet = () => <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
        <View style={isLandscape ? {flexDirection: 'row', flex: 1} : {flexDirection: 'column', flex: 1}}>
            <View style={{flex: 1}}>
                <Text style={[fonts.bigText, {alignSelf: 'center', paddingBottom: 20}]}>
                    Manage Account
                </Text>
                <ScrollView style={{flex: 0.5}}>
                    {
                        (userInfo.loginStatus === 'registered') &&
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
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={handleLogInGoogle(userInfo)}>
                                <Text style={fonts.iconButtonText}>Sign in with Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={signIn}>
                                <Text style={fonts.iconButtonText}>Sign in with Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={createAccount}>
                                <Text style={fonts.iconButtonText}>Create Account</Text>
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
                                              onPress={disconnectFromOrganization(userInfo)}>
                                <Text style={fonts.iconButtonText}>Disconnect from current organization</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {
                        (userInfo.user?.organization === null || userInfo.user?.organization === undefined) &&
                        <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={navConnectOrganization}>
                                <Text style={fonts.iconButtonText}>Connect to existing</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                              onPress={navCreateOrganization}>
                                <Text style={fonts.iconButtonText}>Create new</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </ScrollView>
            </View>
        </View>
    </RBSheet>;

    const PatientSheet = () =>
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
            <View style={{flex: 1}}>
                <Text style={[fonts.bigText, {alignSelf: 'center', paddingBottom: 20}]}>
                    Patients
                </Text>
                <ScrollView style={{flex: 0.5}}>
                    {
                        (userInfo.loginStatus !== 'loading' && userInfo.loginStatus !== 'signed-out') &&
                        <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={editAccount}>
                                <Text style={fonts.iconButtonText}>Create new patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={editAccount}>
                                <Text style={fonts.iconButtonText}>Create new patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={editAccount}>
                                <Text style={fonts.iconButtonText}>Create new patient</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    {
                        (userInfo.loginStatus === 'loading' || userInfo.loginStatus === 'signed-out') &&
                        <ActivityIndicator style={{padding: 15}} size={'large'}/>
                    }
                </ScrollView>
            </View>
        </RBSheet>;

    return (
        <View>
            <View style={[floating.actionBar, isLandscape ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
                <TouchableOpacity style={floating.iconButton} onPress={() => modalRef.current?.open()}>
                    <IconMCI style={floating.iconButtonIcon} name='qrcode-scan' size={28} />
                </TouchableOpacity>
                <TouchableOpacity style={floating.iconButton} onPress={() => modalRef.current?.open()}>
                    <IconFA style={floating.iconButtonIcon} name='user' size={28}/>
                </TouchableOpacity>
                <TouchableOpacity style={floating.iconButton} onPress={() => modalRef.current?.open()}>
                    <IconFA style={floating.iconButtonIcon} name='user-md' size={28}/>
                </TouchableOpacity>
            </View>
            <UserSheet/>
        </View>
    );
}

export default ActionBar;