import React, {useEffect, useReducer, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
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
import {fonts, format, icons, modal} from '../style/style';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from 'react-native-google-signin';


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
            } else {
                // some other error happened
            }
        }
    };

    const signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            auth()
                .signOut()
                .then(() => alert('You are signed out'));
            setloggedIn(false);
            setuserInfo([]);
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


    useEffect(() => {
        GoogleSignin.configure({
            scopes: ['email'], // what API you want to access on behalf of the user, default is email and profile
            webClientId:
                '141405103878-rsc5n2819h3b7fors0u0oadthfv4dmde.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
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

    const [name, setName] = useState('null');
    const [guestWindowVisible, setGuestWindowVisible] = useState(false);
    const [userWindowVisible, setUserWindowVisible] = useState(false);

    const toggleGuestWindow = () => {
        // close other window before opening
        if(orgWindowVisible) setOrgWindowVisible(false);
        setGuestWindowVisible(!guestWindowVisible);
    }

    const toggleUserWindow = () => {
        // close other window before opening
        if(orgWindowVisible) setOrgWindowVisible(false);
        setUserWindowVisible(!userWindowVisible);
    }

    const GuestButtons = () => {
        if (guestWindowVisible) return (
            <View>
                <TouchableOpacity
                    style={format.horizontalSubBar}

                >
                    <Text style={fonts.mediumLink}>Create Account</Text>
                    <IconF style={icons.linkIcon} name='plus' size={20}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={format.horizontalSubBar}

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
        ); else
            return <View/>;
    }

    const UserButtons = () => {
        if (userWindowVisible) return (
            <View>
                <TouchableOpacity
                    style={format.horizontalSubBar}
                    onPress={() => {setEditPatientWindowVisible(!editPatientWindowVisible)}}
                >
                    <Text style={fonts.mediumLink}>Edit Account</Text>
                    <IconA style={icons.linkIcon} name='edit' size={20}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={format.horizontalSubBar}
                    onPress={() => {setEditPatientWindowVisible(!editPatientWindowVisible)}}
                >
                    <Text style={fonts.mediumLink}>Logout  <IconMI name='logout' size={20}/></Text>
                </TouchableOpacity>
            </View>
        ); else
            return <View/>;
    }

    const UserBar = () => {
        if (!loggedIn) {
            return (
                    <TouchableOpacity
                        style={format.horizontalBar}
                        onPress={toggleGuestWindow}
                    >
                        <Text style={fonts.username}>Guest <IconE
                            name={guestWindowVisible ? 'chevron-up' : 'chevron-down'} size={30}/></Text>
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
    const [org, setOrg] = useState(null);   // database key of the current organization
    const [orgName, setOrgName] = useState(null);   // name of the current organization
    const [orgWindowVisible, setOrgWindowVisible] = useState(false);

    // determines when page comes into focus
    const isFocused = useIsFocused();

    const toggleOrgWindow = () => {
        // hide user/guest window if opening organization window
        if(userWindowVisible) setUserWindowVisible(false);
        if(guestWindowVisible) setGuestWindowVisible(false);
        setOrgWindowVisible(!orgWindowVisible);
    }

    const OrganizationWindow = () => {
        if (orgWindowVisible) {
            if (orgName === null)
                return (
                    <View>
                        <TouchableOpacity
                            style={format.horizontalSubBar}

                        >
                            <Text style={fonts.mediumLink}>Connect to Organization  <IconMCI name='database'
                                                                                            size={20}/></Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={format.horizontalSubBar}

                        >
                            <Text style={fonts.mediumLink}>Create an Organization  <IconMCI name='database-plus'
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
                            <Text style={fonts.mediumLink}>Disconnect from {orgName}  <IconMCI name='database-minus'
                                                                                           size={24}/></Text>
                        </TouchableOpacity>
                    </View>
                );
        } else
            return <View/>;
    }


    const OrganizationBar = () => {
        if(name != null) {
            if (orgName === null)
                return (
                    <TouchableOpacity
                        style={format.horizontalBar}
                        onPress={toggleOrgWindow}
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
                    onPress={toggleOrgWindow}
                >
                    <IconMCI style={icons.smallIcon}
                             name='database-check'
                             size={30}/>
                </TouchableOpacity>
            );
        } else {
            return <View />;
        }
    }

    const EditPatientWindow = () => {
        return (
        <Modal
            visible={editPatientWindowVisible}
            transparent={true}
            style={{justifyContent: 'center'}}
        >
            <ScrollView style={modal.modal}>
                <Text style={modal.headingText}>Enter new name</Text>
                <TextInput


                    placeholder={'Enter text'}
                    style={modal.textBox}
                    autoComplete='off'
                    autoCorrect={false}
                />
                <Text style={modal.headingText}>Enter new email</Text>
                <TextInput


                    placeholder={'Enter text'}
                    style={modal.textBox}
                    autoComplete='off'
                    autoCorrect={false}
                />
                <Text style={modal.headingText}>Enter new name</Text>
                <TextInput


                    placeholder={'Enter new phone number'}
                    style={modal.textBox}
                    autoComplete='off'
                    autoCorrect={false}
                />
                <Text style={modal.headingText}>Enter new street address</Text>
                <TextInput


                    placeholder={'Enter text'}
                    style={modal.textBox}
                    autoComplete='off'
                    autoCorrect={false}
                />
                <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                    <TouchableOpacity
                        style={modal.modalCancelButton}

                    >
                        <Text style={{color: '#fff'}}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={modal.modalSubmitButton}

                    >
                        <Text style={{color: '#fff'}}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
        );
    }

    /*

        HOME PAGE

     */

    const [editPatientWindowVisible, setEditPatientWindowVisible] = useState(false);

    return (
        <SafeAreaView style={format.page}>
            <EditPatientWindow />
            <View style={format.pageHeader}>
                <UserBar/>
                <OrganizationBar/>
            </View>
            <GuestButtons/>
            <UserButtons/>
            <OrganizationWindow />
            <DeviceList/>
        </SafeAreaView>
    );
}