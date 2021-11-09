import React, {useEffect, useReducer, useState} from 'react';
import {ActivityIndicator, Button, FlatList, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BleManager, Device} from 'react-native-ble-plx';
import {DeviceCard} from '../components/DeviceCard';

const manager = new BleManager();

// Reducer to add only the devices which have not been added yet
// When the bleManager search for devices, each time it detect a ble device, it returns the ble device even if this one has already been returned
const reducer = (
    state: Device[],
    action: { type: 'ADD_DEVICE'; payload: Device } | { type: 'CLEAR' },
): Device[] => {
    switch (action.type) {
        case 'ADD_DEVICE':
            const {payload: device} = action;

            // check if the detected device is not already added to the list
            if (device && !state.find((dev) => dev.id === device.id)) {
                return [...state, device];
            }
            return state;
        case 'CLEAR':
            return [];
        default:
            return state;
    }
};

export const Bluetooth = ({navigation, route}) => {
    // reducer to store and display detected ble devices
    const [scannedDevices, dispatch] = useReducer(reducer, []);

    // state to give the user a feedback about the manager scanning devices
    const [isLoading, setIsLoading] = useState(false);

    const scanDevices = () => {
        // display the Activity indicator
        setIsLoading(true);

        // scan devices
        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.warn(error);
            }

            // if a device is detected add the device to the list by dispatching the action into the reducer
            if (scannedDevice) {
                dispatch({type: 'ADD_DEVICE', payload: scannedDevice});
            }
        });

        // stop scanning devices after 5 seconds
        setTimeout(() => {
            manager.stopDeviceScan();
            setIsLoading(false);
        }, 5000);
    };

    const ListHeaderComponent = () => (
        <View style={styles.body}>
            <View style={styles.sectionContainer}>
                <Button
                    title="Clear devices"
                    onPress={() => dispatch({type: 'CLEAR'})}
                />
                {isLoading ? (
                    <View style={styles.activityIndicatorContainer}>
                        <ActivityIndicator color={'teal'} size={75}/>
                    </View>
                ) : (
                    <Button title="Scan devices" onPress={scanDevices}/>
                )}
            </View>
        </View>
    );

    useEffect(() => {
        return () => {
            manager.destroy();
        };
    }, []);
    return (
        <SafeAreaView style={styles.body}>
            <FlatList
                keyExtractor={(item) => item.id}
                data={scannedDevices}
                renderItem={({item}) => <DeviceCard device={item}/>}
                ListHeaderComponent={ListHeaderComponent}
                contentContainerStyle={styles.content}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#eee',
        flex: 1,
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row',
    },
    headingContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 18,
        color: '#222',
        flex: 1,
        textAlign: 'left',
    },
    subheadingContainer: {
        paddingTop: 0,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    subheadingText: {
        fontSize: 14,
        color: '#222',
        flex: 1,
        textAlign: 'left',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
        textAlign: 'center',
    },
    navButton: {
        backgroundColor: '#4287f5',
        padding: 15,
        alignSelf: 'stretch',
        borderBottomWidth: 4,
        borderBottomColor: '#326dc9',
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#2cd46a',
        padding: 25,
        alignSelf: 'stretch'
    },
    testButtonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});