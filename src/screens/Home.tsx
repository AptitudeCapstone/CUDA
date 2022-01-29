import React, {useEffect, useReducer, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {BleManager, Device} from "react-native-ble-plx";
import {DeviceCard} from "../components/DeviceCard";
import {Base64} from '../lib/base64';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from "@react-navigation/native";
import {fonts, format, icons} from '../style/style';
import auth from '@react-native-firebase/auth';
import {GoogleSignin, statusCodes,} from 'react-native-google-signin';


const manager = new BleManager();

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

const decodeBleString = (value: string | undefined | null): string => {
    if (!value) return '';
    return Base64.decode(value).charCodeAt(0);
};

export const Home = ({route, navigation}) => {

    /*

        FIREBASE AUTHENTICATION WITH GOOGLE SIGN IN

     */

    const [loggedIn, setloggedIn] = useState(false);
    const [userInfo, setuserInfo] = useState([]);

    const _signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const {accessToken, idToken} = await GoogleSignin.signIn();
            setloggedIn(true);
            const credential = auth.GoogleAuthProvider.credential(
                idToken,
                accessToken,
            );
            await auth().signInWithCredential(credential);
            setUserWindowVisible(false);
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                alert('Cancel');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                alert('Sign in in progress');
                // operation (f.e. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                alert('PLAY_SERVICES_NOT_AVAILABLE');
                // play services not available or outdated
            }
        }
    };

    const signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            auth()
                .signOut()
                .then(() => Alert.alert('Signed out', 'You have been successfully signed out'));
            setloggedIn(false);
            setuserInfo([]);
            setUserWindowVisible(false);
        } catch (error) {
            console.error(error);
        }
    };

    function onAuthStateChanged(user) {
        console.log(user);
        if (user) {
            setloggedIn(true);
            setuserInfo(user);
        }
    }

    // determines when page comes into focus
    const isFocused = useIsFocused();

    useEffect(() => {
        if(auth().currentUser != null)
            setuserInfo(auth().currentUser)
    }, [isFocused]);


    useEffect(() => {
        GoogleSignin.configure({
            scopes: ['email'],
            webClientId:
                '141405103878-rsc5n2819h3b7fors0u0oadthfv4dmde.apps.googleusercontent.com',
            offlineAccess: true,
        });
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);


    /*

        BLUETOOTH

     */

    // used to determine current bluetooth devices in range
    const [scannedDevices, dispatch] = useReducer(reducer, []);
    const [isScanning, setIsScanning] = useState(false);

    // start to scan when page is open, destroy manager when done
    useEffect(() => {
        scanDevices();

        return () => {
            manager.destroy()
        };
    }, []);

    // scan for BLE devices
    const scanDevices = () => {
        // toggle activity indicator on
        setIsScanning(true);

        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) console.warn(error);

            // filter by name for 'raspberrypi'
            if (scannedDevice != null && scannedDevice.name == 'raspberrypi') {
                // stop scanning
                manager.stopDeviceScan();

                // turn off activity indicator
                setIsScanning(false);

                // connect to device
                scannedDevice
                    .connect()
                    .then((deviceData) => {
                        manager.onDeviceDisconnected(
                            deviceData.id,
                            (connectionError, connectionData) => {
                                if (connectionError) console.log(connectionError);

                                console.log(connectionData);
                                console.log('Device is disconnected. Restarting BLE device scan. ');
                                setIsScanning(true);
                                scanDevices();
                            },
                        );

                        return scannedDevice.discoverAllServicesAndCharacteristics();
                    })
                    .then(async (deviceObject) => {
                        console.log('deviceObject: ' + deviceObject);
                        // subscribe for the readable service
                        scannedDevice.monitorCharacteristicForService(
                            '00000001-710e-4a5b-8d75-3e5b444bc3cf',
                            '00000002-710e-4a5b-8d75-3e5b444bc3cf',
                            (error, characteristic) => {
                                if (error) {
                                    console.log('Error in monitorCharacteristicForService');
                                    console.log(error.message);
                                    return;
                                }

                                //console.log(characteristic.uuid, decodeBleString(characteristic.value));
                            },
                        );
                    })
                    .catch((error) => {
                        console.warn(error);
                    });

                // add to devices list using reducer
                dispatch({type: 'ADD_DEVICE', payload: scannedDevice});
            }
        });
    };

    const DeviceList = () => {
        if (scannedDevices.length == 0)
            return (
                <View style={format.deviceList}>
                    <View style={{flexDirection: 'row', paddingTop: 20, marginBottom: 16}}>
                        <Text style={{color: '#eee', fontSize: 14, marginTop: 14, marginBottom: -4}}>No devices
                            found</Text>
                        <Text style={{marginLeft: 20, marginTop: 8, marginBottom: 0}}>
                            <ActivityIndicator color={'white'} size={32}/>
                        </Text>
                    </View>
                </View>
            );
        else return (
            <View style={format.deviceList}>
                <FlatList
                    horizontal={true}
                    keyExtractor={(item) => item.id}
                    data={scannedDevices}
                    renderItem={({item}) => <DeviceCard device={item} navigation={navigation}/>}
                />
            </View>
        );
    }

    /*

        User Bar

     */

    const [userWindowVisible, setUserWindowVisible] = useState(false);


    const toggleUserWindow = () => {
        // close other window before opening
        if (orgWindowVisible) setOrgWindowVisible(false);
        setUserWindowVisible(!userWindowVisible);
    }


    const UserButtons = () => {
        if (userWindowVisible) {
            if (loggedIn)
                return (
                    <View>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={() => {
                                navigation.navigate('Edit Account');
                            }}
                        >
                            <Text style={fonts.mediumLink}>Edit Account</Text>
                            <IconA style={icons.linkIcon} name='edit' size={20}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={signOut}
                        >
                            <Text style={fonts.mediumLink}>Logout</Text>
                            <IconMI style={icons.linkIcon} name='logout' size={20}/>
                        </TouchableOpacity>
                    </View>
                );
            else return (
                <View>
                    <TouchableOpacity
                        style={format.horizontalSubBar}
                        onPress={() => {
                            setUserWindowVisible(false);
                            navigation.navigate('Create Account');
                        }}
                    >
                        <Text style={fonts.mediumLink}>Create Account</Text>
                        <IconF style={icons.linkIcon} name='plus' size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={format.horizontalSubBar}
                        onPress={() => {
                            setUserWindowVisible(false);
                            navigation.navigate('Sign In');
                        }}
                    >
                        <Text style={fonts.mediumLink}>Sign in</Text>
                        <IconF style={icons.linkIcon} name='user' size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={format.horizontalSubBar}
                        onPress={_signIn}
                    >
                        <Text style={fonts.mediumLink}>Sign in with Google</Text>
                        <IconI style={icons.linkIcon} name='logo-google' size={20}/>
                    </TouchableOpacity>
                </View>
            );
        } else return <View/>;
    }

    const UserBar = () => {
        if (!loggedIn) {
            return (
                <TouchableOpacity
                    style={format.horizontalBar}
                    onPress={toggleUserWindow}
                >
                    <Text style={fonts.username}>Guest <IconE
                        name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={30}/></Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={format.horizontalBar}
                    onPress={toggleUserWindow}
                >
                    <Text style={fonts.username}>{userInfo.displayName} <IconE
                        name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={30}/></Text>
                </TouchableOpacity>
            );
        }
    }

    /*

        Organization Bar

     */

    // used throughout pages to determine the currently synced organization
    const [orgID, setOrgID] = useState(null);   // database key of the current organization
    const [orgName, setOrgName] = useState(null);   // name of the current organization
    const [orgWindowVisible, setOrgWindowVisible] = useState(false);

    const OrganizationWindow = () => {
        if (orgWindowVisible) {
            if (orgName === null)
                return (
                    <View>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={() => {navigation.navigate('Connect Organization')}}
                        >
                            <Text style={fonts.mediumLink}>Connect to Organization <IconMCI name='database'
                                                                                            size={20}/></Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={() => {navigation.navigate('Create Organization')}}
                        >
                            <Text style={fonts.mediumLink}>Create an Organization <IconMCI name='database-plus'
                                                                                           size={20}/></Text>
                        </TouchableOpacity>
                    </View>
                );
            else
                return (
                    <View>
                        <View
                            style={format.horizontalSubBar}

                        >
                            <Text style={fonts.mediumLink}>Add code: 12345</Text>
                        </View>
                        <TouchableOpacity
                            style={format.horizontalSubBar}

                        >
                            <Text style={fonts.mediumLink}>Disconnect from {orgName} <IconMCI name='database-minus'
                                                                                              size={24}/></Text>
                        </TouchableOpacity>
                    </View>
                );
        } else
            return <View/>;
    }


    const OrganizationBar = () => {
        if (userInfo != []) {
            if (orgName === null)
                return (
                    <TouchableOpacity
                        style={format.horizontalBar}
                        onPress={() => {if(userWindowVisible) setUserWindowVisible(false); setOrgWindowVisible(!orgWindowVisible)}}
                    >
                        <IconMCI
                            style={icons.smallIcon}
                            name='database'
                            size={30}/>
                    </TouchableOpacity>
                );
            else return (
                <TouchableOpacity
                    style={format.horizontalBar}
                    onPress={() => {if(userWindowVisible) setUserWindowVisible(false); setOrgWindowVisible(!orgWindowVisible)}}
                >
                    <IconMCI style={icons.smallIcon}
                             name='database-check'
                             size={30}/>
                </TouchableOpacity>
            );
        } else {
            return <View/>;
        }
    }


    /*

        HOME PAGE

     */

    return (
        <SafeAreaView style={format.page}>
            <View style={format.pageHeader}>
                <UserBar/>
                <OrganizationBar/>
            </View>
            <UserButtons/>
            <OrganizationWindow/>
            <DeviceList/>
        </SafeAreaView>
    );
}