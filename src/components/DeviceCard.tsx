import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Device} from 'react-native-ble-plx';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconAD from 'react-native-vector-icons/AntDesign';

type DeviceCardProps = {
    navigation: any;
    device: Device;
};

const DeviceCard = ({navigation, device}: DeviceCardProps) => {

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // is the device connected?
        device.isConnected().then(setIsConnected);
    }, [device]);

    let iconName = '';
    if (device.rssi >= -50) {
        iconName = 'signal-cellular-3';
    } else if (device.rssi >= -75) {
        iconName = 'signal-cellular-2';
    } else if (device.rssi >= -85) {
        iconName = 'signal-cellular-1';
    }

    return (
        <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Device', {navigation, device})}
        >
            {/*<Text style={styles.navButtonText}>{device.id}</Text><Text style={styles.navButtonText}>{`Name : ${device.name}`}</Text>*/}
            {isConnected ? (
                <Text style={styles.navButtonText} numberOfLines={1} ellipsizeMode='middle'>
                    {device.id}
                    <View style={{paddingLeft: 25}}><IconMCI style={{textAlign: 'right'}} name={iconName} size={24}
                                                             color="#fff"/></View>
                    <View style={{paddingLeft: 25}}><IconAD style={{textAlign: 'right'}} name='checkcircle' size={24}
                                                            color="#fff"/></View>
                </Text>
            ) : (
                <Text>
                    <IconAD name='plus' size={24} color="#fff"/>
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    navButton: {
        backgroundColor: '#444',
        padding: 20,
        alignSelf: 'stretch',
        borderBottomWidth: 2,
        borderBottomColor: '#666',
        alignItems: 'center'
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
        alignItems: 'center'
    },
});

export {DeviceCard};
