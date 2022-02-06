import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from "@react-navigation/native";
import {fonts, format, icons, buttons} from '../../style/style';
import auth from '@react-native-firebase/auth';
import {GoogleSignin, statusCodes,} from 'react-native-google-signin';
import database from "@react-native-firebase/database";
import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';
const Buffer = require('buffer/').Buffer;

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

    const [isScanning, setIsScanning] = useState(false);
    const peripherals = new Map();
    const [list, setList] = useState([]);
    const BleManagerModule = NativeModules.BleManager;
    const bleEmitter = new NativeEventEmitter(BleManagerModule);
    const [testMode, setTestMode] = useState('write');

    // start to scan peripherals
    const startScan = () => {
        if (isScanning) {
            return;
        }

        // first, clear existing peripherals
        peripherals.clear();
        setList(Array.from(peripherals.values()));

        // then re-scan it
        BleManager.scan([], 3, false)
            .then(() => {
                console.log('Scanning for BLE devices');
                setIsScanning(true);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    // handle discovered peripheral
    const handleDiscoverPeripheral = (peripheral) => {
        if(peripheral.name == 'raspberrypi' || peripheral.name == 'CUDA Tester') {
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
    };

    // handle stop scan event
    const handleStopScan = () => {
        console.log('Stopping BLE scan');
        setIsScanning(false);
    };

    // handle disconnected peripheral
    const handleDisconnectedPeripheral = (data) => {
        console.log('Disconnected from ' + data.peripheral);

        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
    };

    // handle update value for characteristic
    const handleUpdateValueForCharacteristic = (data) => {
        console.log(
            'Received data from: ' + data.peripheral,
            'Characteristic: ' + data.characteristic,
            'Data: ' + data.value,
        );
    };

    // retrieve connected peripherals.
    const retrieveConnectedPeripheral = () => {
        BleManager.getConnectedPeripherals([]).then((results) => {
            peripherals.clear();
            setList(Array.from(peripherals.values()));

            if (results.length === 0) {
                console.log('No connected peripherals');
            }

            for (let i = 0; i < results.length; i++) {
                let peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                setList(Array.from(peripherals.values()));
            }
        });
    };

    // update stored peripherals
    const updatePeripheral = (peripheral, callback) => {
        let p = peripherals.get(peripheral.id);
        if (!p) {
            return;
        }

        p = callback(p);
        peripherals.set(peripheral.id, p);
        setList(Array.from(peripherals.values()));
    };

    // get advertised peripheral local name (if exists). default to peripheral name
    const getPeripheralName = (item) => {
        if (item.advertising) {
            if (item.advertising.localName) {
                return item.advertising.localName;
            }
        }

        return item.name;
    };

    // connect to peripheral then test the communication
    const connectAndTestPeripheral = (peripheral) => {
        if (!peripheral) {
            return;
        }

        if (peripheral.connected) {
            BleManager.disconnect(peripheral.id);
            return;
        }

        // connect to selected peripheral
        BleManager.connect(peripheral.id)
            .then(() => {
                console.log('Connected to ' + peripheral.id, peripheral);

                // update connected attribute
                updatePeripheral(peripheral, (p) => {
                    p.connected = true;
                    return p;
                });

                // retrieve peripheral services info
                BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                    console.log('Retrieved peripheral services', peripheralInfo);

                    // test read current peripheral RSSI value
                    BleManager.readRSSI(peripheral.id).then((rssi) => {
                        console.log('Retrieved actual RSSI value', rssi);

                        // update rssi value
                        updatePeripheral(peripheral, (p) => {
                            p.rssi = rssi;
                            return p;
                        });
                    });

                    // test read and write data to peripheral
                    const serviceUUID = 'ab173c6c-8493-412d-897c-1974fa74fc13';
                    const charasteristicUUID = '04cb0eb1-8b58-44d0-91e4-080af33438bb';

                    console.log('peripheral id:', peripheral.id);
                    console.log('service:', serviceUUID);
                    console.log('characteristic:', charasteristicUUID);

                    switch (testMode) {
                        case 'write':
                            // ===== test write data
                            const payload = writeVal;
                            const payloadBytes = stringToBytes(payload);
                            console.log('payload:', payload);

                            BleManager.write(peripheral.id, serviceUUID, charasteristicUUID, payloadBytes)
                                .then((res) => {
                                    console.log('write response', res);
                                    alert(`wrote value "${payload}"`);
                                })
                                .catch((error) => {
                                    console.log('write err', error);
                                });
                            break;

                        case 'read':
                            // ===== test read data
                            BleManager.read(peripheral.id, serviceUUID, charasteristicUUID)
                                .then((res) => {
                                    console.log('read response', res);
                                    if (res) {
                                        const buffer = Buffer.from(res);
                                        const data = buffer.toString();
                                        console.log('data', data);
                                        setReadVal(data);
                                        alert(`read value "${data}"`);
                                    }
                                })
                                .catch((error) => {
                                    console.log('read err', error);
                                    alert(error);
                                });
                            break;

                        case 'notify':
                            // ===== test subscribe notification
                            BleManager.startNotification(peripheral.id, serviceUUID, charasteristicUUID)
                                .then((res) => {
                                    console.log('start notification response', res);
                                });
                            break;

                        default:
                            break;
                    }
                });
            })
            .catch((error) => {
                console.log('Connection error', error);
            });
    };

    // mount and onmount event handler
    useEffect(() => {
        console.log('Mount');

        // initialize BLE modules
        BleManager.start({ showAlert: false });

        // add ble listeners on mount
        bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleEmitter.addListener('BleManagerStopScan', handleStopScan);
        bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

        // check location permission only for android device
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
                if (r1) {
                    console.log('Permission is OK');
                    return;
                }

                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
                    if (r2) {
                        console.log('User accept');
                        return
                    }

                    console.log('User refuse');
                });
            });
        }

        // remove ble listeners on unmount
        return () => {
            console.log('Unmount');

            bleEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
            bleEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        };
    }, []);


    /*

        DEVICE LIST DISPLAY

    */

    const [writeVal, setWriteVal] = useState('0');
    const [readVal, setReadVal] = useState('none');
    const [peripheral, setPeripheral] = useState(null);

    const DeviceCard = (device) => {

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
                style={device.connected ? {
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
                onPress={() => {
                    setPeripheral(device);
                }}
            >
                <View style={{borderRadius: 5000, paddingBottom: 4}}>
                    {iconName != '' &&
                        <IconMCI name={iconName} size={30}
                             color="#fff"/>
                    }
                </View>
                <Text style={{
                    fontSize: 14,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>{getPeripheralName(device)}</Text>
                <Text style={{
                    fontSize: 14,
                    color: '#eee',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>{device.id}</Text>
            </TouchableOpacity>
        );

    };

    const BluetoothTester = () => {
        return (
            <View style={{borderWidth: 1, borderColor: '#555', padding: 15, margin: 15, borderRadius: 10}}>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity
                    style={(testMode !== 'read') ? buttons.unselectedButton : buttons.covidSelectButton}
                    onPress={() => setTestMode('read')}
                >
                    <Text style={fonts.selectButtonText}>Read</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(testMode !== 'write') ? buttons.unselectedButton : buttons.covidSelectButton}
                    onPress={() => setTestMode('write')}
                >
                    <Text style={fonts.selectButtonText}>Write</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(testMode !== 'notify') ? buttons.unselectedButton : buttons.covidSelectButton}
                    onPress={() => setTestMode('notify')}
                >
                    <Text style={fonts.selectButtonText}>Notify</Text>
                </TouchableOpacity>
            </View>
        {
            testMode === 'write' &&
            <TextInput
                style={{margin: 15, padding: 15, color: '#eee', borderColor: '#555', borderWidth: 1, borderRadius: 10}}
                onChangeText={(text) => setWriteVal(text)}
            />
        }
        {
            testMode === 'read' &&
            <Text style={[fonts.username, {padding: 20, textAlign: 'center'}]}>Most recent value: {readVal}</Text>
        }
        <TouchableOpacity
            style={[buttons.submitButton, {marginBottom: 10}]}
            onPress={() => connectAndTestPeripheral(peripheral)}
        >
            <Text style={buttons.submitButtonText}>Send Request</Text>
        </TouchableOpacity>
            </View>
    )
    };


    const DeviceList = () => {
        if (list.length == 0)
            return (
                <View>
                <View style={format.deviceList}>
                    <View style={{flexDirection: 'row', paddingTop: 20, marginBottom: 16}}>
                        <Text style={{color: '#eee', fontSize: 16, marginTop: 14, marginBottom: -4}}>Searching for CUDA devices</Text>
                        <Text style={{marginLeft: 15, marginTop: 8, marginBottom: 0}}>
                            <ActivityIndicator color={'white'} size={36}/>
                        </Text>
                    </View>
                </View>
                    <TouchableOpacity
                        style={buttons.submitButton}
                        onPress={() => startScan()}
                    >
                        <Text style={buttons.submitButtonText}>Start Scan</Text>
                    </TouchableOpacity>
                </View>
            );
            else return (
            <View>
                <View style={format.deviceList}>
                    <FlatList
                        horizontal={true}
                        data={list}
                        renderItem={({item}) => DeviceCard(item)}
                        keyExtractor={(item) => item.id}
                    />
                </View>
                <BluetoothTester />
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