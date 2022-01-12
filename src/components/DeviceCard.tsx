import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Device} from 'react-native-ble-plx';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';

const DeviceCard = ({navigation, device}) => {

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
            style={isConnected ? styles.navButtonConnected : styles.navButton}
            onPress={() => navigation.navigate('Device', {navigation: navigation, device: device})}
        >
            <View style={styles.navIcon}>
                <IconMCI name={iconName} size={30}
                         color="#fff"/>
            </View>
            <Text style={styles.navButtonText}>{device.name}</Text>
        </TouchableOpacity>
        );

};

const styles = StyleSheet.create({
    navButton: {
        margin: 0,
        textAlign: 'center',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 13
    },
    navButtonConnected: {
        backgroundColor: '#333',
        margin: 0,
        textAlign: 'center',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 17,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#555'
    },
    navIcon: {
        borderRadius: 5000,
        paddingBottom: 4
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
});

export {DeviceCard};
