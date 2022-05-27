import React, {useRef} from 'react';
import {backgroundColor, device, rbCameraSheetStyle} from '../style/Styles';
import { FloatingAction } from "react-native-floating-action";
import IconMCI from "react-native-vector-icons/MaterialCommunityIcons";
import IconMI from "react-native-vector-icons/MaterialCommunityIcons";
import IconF from "react-native-vector-icons/Foundation";
import IconFA from "react-native-vector-icons/FontAwesome5";
import {UserSheet} from "../components/UserSheet";
import {PatientSheet} from "../components/PatientSheet";
import {View} from "react-native";

const ActionBar = ({navigation}) => {
    const userSheetRef = useRef(null);
    const patientSheetRef = useRef(null);

    const actions = [
        {
            text: "My Account",
            icon: <IconFA name='user-md' color={backgroundColor} size={30}/>,
            name: "account",
            buttonSize: 60,
            color:'#8d67a8',
            position: 1
        },
        {
            text: "Patients",
            icon: <IconF name='results-demographics' color={backgroundColor} size={30}/>,
            name: "patients",
            buttonSize: 60,
            color:'#8d67a8',
            position: 2
        },
        {
            text: "Scan QR",
            icon: <IconMCI name='qrcode-scan' color={backgroundColor} size={30}/>,
            name: "qr",
            buttonSize: 60,
            color:'#8d67a8',
            position: 3
        },
    ];

    return (
        <View>
            <FloatingAction
                actions={actions}
                distanceToEdge={{ vertical: 120, horizontal: 20 }}
                iconWidth={20}
                iconHeight={20}
                buttonSize={68}
                overlayColor={'rgb(141, 103, 168, 1.0)'}
                color={'#8d67a8'}
                floatingIcon={<IconMI name='menu' color={backgroundColor} size={30}/>}
                style={{marginBottom: 60}}
                onPressItem={name => {
                    if(name === 'account') {
                        userSheetRef.current?.open();
                    } else if(name === 'patients') {
                        patientSheetRef.current?.open();
                    } else if (name === 'qr') {
                        navigation.navigate('User Stack', { screen: 'QR Scan'});
                    }
                }}
            />
            <View>
                <UserSheet navigation={navigation} modalRef={userSheetRef} />
                <PatientSheet navigation={navigation} modalRef={patientSheetRef} />
            </View>
        </View>
    );
}

export default ActionBar;