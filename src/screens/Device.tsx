import React, {useCallback, useEffect, useState} from 'react';
import {Button, LogBox, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Service} from 'react-native-ble-plx';
import {ServiceCard} from '../components/ServiceCard';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state'])

export const DeviceScreen = ({route, navigation}) => {
    // get the device object which was given through navigation params
    const {device} = route.params;

    const [isConnected, setIsConnected] = useState(false);
    const [services, setServices] = useState<Service[]>([]);

    // handle the device disconnection
    const disconnectDevice = useCallback(async () => {
        //navigation.goBack();
        const isDeviceConnected = await device.isConnected();
        if (isDeviceConnected) {
            await device.cancelConnection();
        }
    }, [device, navigation]);

    useEffect(() => {
        const getDeviceInformation = async () => {
            // connect to the device
            const connectedDevice = await device.connect();
            setIsConnected(true);

            // discover all device services and characteristics
            const allServicesAndCharacteristics = await connectedDevice.discoverAllServicesAndCharacteristics();
            // get the services only
            const discoveredServices = await allServicesAndCharacteristics.services();
            setServices(discoveredServices);
        };

        getDeviceInformation();

        device.onDisconnected(() => {
            if(navigation.canGoBack()) {
                navigation.goBack();
            }
        });

        // give a callback to the useEffect to disconnect the device when we will leave the device screen
        return () => {
            disconnectDevice();
        };
    }, [device, disconnectDevice]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Button title="Disconnect" onPress={disconnectDevice}/>
            <View>
                <View style={styles.header}>
                    <Text style={{color: '#fff'}}>{'Id: ' + device.id}</Text>
                    <Text style={{color: '#fff'}}>{'Name: ' + device.name}</Text>
                    <Text style={{color: '#fff'}}>{'Is connected: ' + isConnected}</Text>
                    <Text style={{color: '#fff'}}>{'RSSI: ' + device.rssi}</Text>
                    <Text style={{color: '#fff'}}>{'ServiceData: ' + device.serviceData}</Text>
                    <Text style={{color: '#fff'}}>{'UUIDS : ' + device.serviceUUIDs}</Text>
                </View>
                {/* Display a list of all services */}
                {services &&
                    services.map((service) => <ServiceCard service={service} navigation={navigation}/>)
                }
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },

    header: {
        backgroundColor: '#222',
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: 'rgba(60,64,67,0.3)',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 4,
        padding: 12,
    },
});