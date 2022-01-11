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
            style={styles.navButton}
            onPress={() => navigation.navigate('Device', {navigation: navigation, device: device})}
        >
            {/*<Text style={styles.navButtonText}>{device.id}</Text><Text style={styles.navButtonText}>{`Name : ${device.name}`}</Text>*/}
            {isConnected ?
                (
                        <View style={styles.navIconSelected}>
                            <IconMCI name={iconName} size={24}
                                     color="#fff"/>
                        </View>
                ) : (
                        <View style={styles.navIcon}>
                            <IconMCI name={iconName} size={24}
                                     color="#fff"/>
                        </View>
                )}
            <Text style={styles.navButtonText}>{device.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    navButton: {
        margin: 15,
        textAlign: 'center',
        alignItems: 'center',
    },
    navIcon: {
        backgroundColor: '#333',
        padding: 14,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 5000,
        marginBottom: 10
    },
    navIconSelected: {
        backgroundColor: '#555',
        padding: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5000,
        marginBottom: 10
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
