import React from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {fonts, format, rbSheetStyle} from "../../style/Styles";
import {ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {logOut} from "../../auth/Auth";
import useAuth from "../../auth/UserContext";

export const AccountSheet = ({modalRef, editModalRef}) => {
    const userInfo = useAuth()
    const dimensions = useWindowDimensions();
    const isLandscape = (dimensions.width > dimensions.height);

    const editAccount = () => {
        modalRef.current.close();
        editModalRef.current.open();
    }

    const handleLogOut = () => logOut().then(() => modalRef.current.close());

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
        <View style={isLandscape ? {flexDirection: 'row', flex: 1} : {flexDirection: 'column', flex: 1}}>
                <ScrollView style={{flex: 0.5}}>
                    {
                        (userInfo.loginStatus === 'registered')
                        ? <View>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => editAccount()}>
                                <Text style={fonts.mediumText}>Edit my account</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]} onPress={() => handleLogOut()}>
                                <Text style={fonts.mediumText}>Logout</Text>
                            </TouchableOpacity>
                        </View> : null
                    }
                    {
                        (userInfo.loginStatus === 'loading' || userInfo.loginStatus === 'signed-out')
                            ? <ActivityIndicator style={{padding: 15}} size={'large'}/>
                            : null
                    }
                </ScrollView>
        </View>
    </RBSheet>);
}