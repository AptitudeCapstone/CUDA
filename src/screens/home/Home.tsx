import React, {useEffect, useReducer, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {BleManager, Device, State} from "react-native-ble-plx";
import {Base64} from '../../lib/base64';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from "@react-navigation/native";
import {fonts, format, icons} from '../../style/style';
import auth from '@react-native-firebase/auth';
import {GoogleSignin, statusCodes,} from 'react-native-google-signin';
import database from "@react-native-firebase/database";

/*

    DEVICE CARD

 */

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
            style={isConnected ? {
                backgroundColor: '#333',
                margin: 0,
                textAlign: 'center',
                alignItems: 'center',
                padding: 16,
                paddingBottom: 17,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#555'
            } : {
                margin: 0,
                textAlign: 'center',
                alignItems: 'center',
                padding: 16,
                paddingBottom: 13
            }}
            onPress={() => {if(!device.isConnected()) device.connect().catch(error => console.log(error))}}
        >
            <View style={{borderRadius: 5000, paddingBottom: 4}}>
                <IconMCI name={iconName} size={30}
                         color="#fff"/>
            </View>
            <Text style={{
                fontSize: 14,
                color: '#eee',
                textAlign: 'center',
                overflow: 'hidden',
            }}>{device.name}</Text>
        </TouchableOpacity>
    );

};

/*

    BLE CONNECTION

 */

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

    const [userInfo, setUserInfo] = useState([]);

    const _signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            // @ts-ignore
            const {accessToken, idToken} = await GoogleSignin.signIn();
            const credential = auth.GoogleAuthProvider.credential(
                idToken,
                accessToken,
            );
            await auth().currentUser.linkWithCredential(credential).then(function (userCredentials) {
                // update /users/  with organization for the signed in user
                database().ref('users/' + auth().currentUser.uid).update({
                    displayName: auth().currentUser.providerData[0].displayName
                });
                database().ref('users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                    if (userSnapshot.val()) {
                        setUserInfo(userSnapshot.val());
                        if (userSnapshot.val().organization === undefined || userSnapshot.val().organization === null) {
                            console.log('userSnapshot.val()');
                            setOrgInfo(null);
                        } else
                            database().ref('organizations/' + userSnapshot.val().organization).once('value', function (orgSnapshot) {
                                setOrgInfo(orgSnapshot.val());
                            });
                    }
                });
                Alert.alert('Signed In', 'You have been successfully signed in');
            }).catch(error => {
                // account exists, merge data to account and delete old user
                // TO DO...

                auth().signInWithCredential(credential).then(r => {
                    database().ref('users/' + auth().currentUser.uid).update({
                        displayName: auth().currentUser.providerData[0].displayName
                    });
                    database().ref('users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                        if (userSnapshot.val()) {
                            setUserInfo(userSnapshot.val());
                            if (userSnapshot.val().organization === undefined || userSnapshot.val().organization === null) {
                                console.log('userSnapshot.val()');
                                setOrgInfo(null);
                            } else
                                database().ref('organizations/' + userSnapshot.val().organization).once('value', function (orgSnapshot) {
                                    setOrgInfo(orgSnapshot.val());
                                });
                        }
                    });
                    Alert.alert('Signed In', 'You have been successfully signed in');
                });
            });
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
        // first sign out of registered account
        try {
            //await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            auth().signOut().then(() => {
                Alert.alert('Signed out', 'You have been successfully signed out');
                // then log in to anonymous (guest) account
                auth().signInAnonymously().then(() => {
                    console.log('User signed in anonymously with uid ' + auth().currentUser.uid);


                    setUserInfo([]);
                    setOrgInfo(null);
                    setUserWindowVisible(false);
                }).catch(error => {
                    console.error(error);
                });
            });
        } catch (error) {
            console.error(error);
        }
    };

    function onAuthStateChanged(user) {
        if (user) {
            database().ref('users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                if (userSnapshot.val()) {
                    setUserInfo(userSnapshot.val());
                }
            });
        }
    }

    // determines when page comes into focus
    const isFocused = useIsFocused();

    // update user info with current authenticated user info
    // also get organization info from user, update organization info
    useEffect(() => {
        if (auth().currentUser != null)
            // update user info based on database info
            database().ref('users/' + auth().currentUser.uid).once('value', function (userSnapshot) {
                if (userSnapshot.val()) {
                    setUserInfo(userSnapshot.val());
                    if (userSnapshot.val().organization === undefined || userSnapshot.val().organization === null) {
                        setOrgInfo(null);
                        console.log('user has no org');
                    } else
                        database().ref('organizations/' + userSnapshot.val().organization).once('value', function (orgSnapshot) {
                            setOrgInfo(orgSnapshot.val());
                            console.log(orgSnapshot.val());
                        });
                } else {
                    setOrgInfo(null);
                    console.log('user not registered');
                }
            });
        else
            auth().signInAnonymously().then(() => {
                console.log('User signed in anonymously with uid ' + auth().currentUser.uid);
            }).catch(error => {
                console.error(error);
            });
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

    const [scannedDevices, dispatch] = useReducer(reducer, []);

    // start to scan when page is open, destroy manager when done
    useEffect(() => {
        startDevicesScan();

        return () => {
            manager.destroy()
        };
    }, []);

    async function waitUntilBluetoothReady() {
        let {PoweredOn, PoweredOff, Unauthorized, Unsupported} = State;
        console.log('Waiting until bluetooth is ready');
        return new Promise(async (resolve, reject) => {
            manager.onStateChange(state => {
                console.log('State changed : ', state);
                if (state === PoweredOn) {
                    resolve(true);
                }
            });

            // Verify if the state is already poweredOn before the listener was created
            let crtState = await manager.state();
            console.log('Base state', crtState);
            if (crtState === PoweredOn) {
                resolve(true);
            }
            else if (
                crtState === PoweredOff ||
                crtState === Unauthorized ||
                crtState === Unsupported
            ) {
                reject(new Error('Bluetooth is not available: ' + crtState));
            }
        });
    }

    let scannedDevice = null;

    // scan for BLE devices
    async function startDevicesScan() {
        waitUntilBluetoothReady()
            .then(() => {
                console.log('Starting device scan');
                const scanOptions = {
                    allowDuplicates: false,
                };
                manager.startDeviceScan(null, scanOptions, (error, scannedDevice) => {
                    if (error) console.warn(error);

                    //console.log(scannedDevice.name);

                    // filter by name for 'raspberrypi'
                    if (scannedDevice != null && (scannedDevice.name == 'raspberrypi' || scannedDevice.name == 'pie123')) {

                        // connect to device
                        scannedDevice
                            .connect()
                            .then((deviceData) => {
                                // stop scanning
                                manager.stopDeviceScan();

                                manager.onDeviceDisconnected(
                                    deviceData.id,
                                    (connectionError, connectionData) => {
                                        if (connectionError) console.log(connectionError);

                                        console.log(connectionData);
                                        console.log('Device is disconnected. Restarting BLE device scan. ');
                                        startDevicesScan();
                                    },
                                );

                                return scannedDevice.discoverAllServicesAndCharacteristics();
                            })
                            .then(async (deviceObject) => {
                                console.log('deviceObject: ' + deviceObject);
                                // add to devices list using reducer
                                dispatch({type: 'ADD_DEVICE', payload: scannedDevice});
                                console.log('Connecting to ' + scannedDevice.name)
                                // subscribe for the readable service
                                scannedDevice.monitorCharacteristicForService(
                                    'ab173c6c-8493-412d-897c-1974fa74fc13',
                                    '04cb0eb1-8b58-44d0-91e4-080af33438be',
                                    (error, characteristic) => {
                                        if (error) {
                                            console.log('Error in monitorCharacteristicForService');
                                            console.log(error.message);
                                            return;
                                        }

                                        console.log(characteristic.uuid, decodeBleString(characteristic.value));
                                    },
                                );
                            })
                            .catch((error) => {
                                console.warn(error);
                            });
                    }
                });
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    const DeviceList = () => {
        if (scannedDevices.length == 0)
            return (
                <View style={format.deviceList}>
                    <View style={{flexDirection: 'row', paddingTop: 20, marginBottom: 16}}>
                        <Text style={{color: '#eee', fontSize: 16, marginTop: 14, marginBottom: -4}}>Searching for CUDA devices</Text>
                        <Text style={{marginLeft: 15, marginTop: 8, marginBottom: 0}}>
                            <ActivityIndicator color={'white'} size={36}/>
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
            if (auth().currentUser != null && !auth().currentUser.isAnonymous)
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
                        onPress={_signIn}
                    >
                        <Text style={fonts.mediumLink}>Sign in with Google</Text>
                        <IconI style={icons.linkIcon} name='logo-google' size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={format.horizontalSubBar}
                        onPress={() => {
                            setUserWindowVisible(false);
                            navigation.navigate('Sign In');
                        }}
                    >
                        <Text style={fonts.mediumLink}>Sign in with Email</Text>
                        <IconF style={icons.linkIcon} name='user' size={20}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={format.horizontalSubBar}
                        onPress={() => {
                            setUserWindowVisible(false);
                            navigation.navigate('Create Account');
                        }}
                    >
                        <Text style={fonts.mediumLink}>Create Account</Text>
                        <IconF style={icons.linkIcon} name='user-plus' size={20}/>
                    </TouchableOpacity>
                </View>
            );
        } else return <View/>;
    }

    const UserBar = () => {
        if (auth().currentUser != null && auth().currentUser.isAnonymous) {
            return (
                <TouchableOpacity
                    style={format.horizontalBar}
                    onPress={toggleUserWindow}
                >
                    <Text style={fonts.username}>Guest <IconE
                        name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={34}/></Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={format.horizontalBar}
                    onPress={toggleUserWindow}
                >
                    <Text style={fonts.username}>{userInfo.displayName} <IconE
                        name={userWindowVisible ? 'chevron-up' : 'chevron-down'} size={34}/></Text>
                </TouchableOpacity>
            );
        }
    }

    /*

        Organization Bar

     */

    // used throughout pages to determine the currently synced organization
    const [orgWindowVisible, setOrgWindowVisible] = useState(false);
    const [orgInfo, setOrgInfo] = useState(null);

    const disconnectFromOrganization = () => {
        database().ref('/users/' + auth().currentUser.uid).update({
            organization: null
        }).then(r => {
                Alert.alert('Disconnected', 'No longer syncing with ' + orgInfo.name)
                setOrgInfo(null);
            }
        );
    }

    const OrganizationWindow = () => {
        if (orgWindowVisible) {
            if (orgInfo === null)
                return (
                    <View>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={() => {
                                navigation.navigate('Connect Organization')
                            }}
                        >
                            <Text style={fonts.mediumLink}>Connect to Organization <IconMCI name='database'
                                                                                            size={20}/></Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={() => {
                                navigation.navigate('Create Organization')
                            }}
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
                            <Text style={fonts.mediumLink}>Add code: {orgInfo.addCode}</Text>
                        </View>
                        <TouchableOpacity
                            style={format.horizontalSubBar}
                            onPress={() => disconnectFromOrganization()}
                        >
                            <Text style={fonts.mediumLink}>Disconnect from {orgInfo.name} <IconMCI name='database-minus'
                                                                                                   size={24}/></Text>
                        </TouchableOpacity>
                    </View>
                );
        } else
            return <View/>;
    }

    const OrganizationBar = () => {
        if (orgInfo === null)
            return (
                <TouchableOpacity
                    style={format.horizontalBar}
                    onPress={() => {
                        if (userWindowVisible) setUserWindowVisible(false);
                        setOrgWindowVisible(!orgWindowVisible)
                    }}
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
                onPress={() => {
                    if (userWindowVisible) setUserWindowVisible(false);
                    setOrgWindowVisible(!orgWindowVisible)
                }}
            >
                <IconMCI style={icons.smallIcon}
                         name='database-check'
                         size={30}/>
            </TouchableOpacity>
        );
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