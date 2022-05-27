import React from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import {fonts, format, rbSheetStyle} from "../../Styles";
import {ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import useAuth from "../../contexts/UserContext";

export const PatientSheet = ({navigation, modalRef}) => {
    const dimensions = useWindowDimensions();
    const userInfo = useAuth();

    return (
        <RBSheet ref={modalRef} height={dimensions.height * 0.75} customStyles={rbSheetStyle}>
        <View style={{flex: 1}}>
            <Text style={[fonts.bigText, {alignSelf: 'center', paddingBottom: 20}]}>
                Patients
            </Text>
            <ScrollView style={{flex: 0.5}}>
                {
                    (userInfo.loginStatus !== 'loading' && userInfo.loginStatus !== 'signed-out') &&
                    <View>
                        <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                          onPress={() => navigation.navigate('Create COVID patient')}>
                            <Text style={fonts.iconButtonText}>Create new COVID patient</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                          onPress={() => navigation.navigate('Edit COVID patient')}>
                            <Text style={fonts.iconButtonText}>Edit a COVID patient</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                          onPress={() => navigation.navigate('Create fibrinogen patient')}>
                            <Text style={fonts.iconButtonText}>Create new fibrinogen patient</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[format.iconButton, {marginBottom: 10}]}
                                          onPress={() => navigation.navigate('Edit fibrinogen patient')}>
                            <Text style={fonts.iconButtonText}>Edit a fibrinogen patient</Text>
                        </TouchableOpacity>
                    </View>
                }
                {
                    (userInfo.loginStatus === 'loading' || userInfo.loginStatus === 'signed-out') &&
                    <ActivityIndicator style={{padding: 15}} size={'large'}/>
                }
            </ScrollView>
        </View>
    </RBSheet>);
}