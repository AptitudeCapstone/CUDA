import React, {useEffect, useState} from 'react';
import {Alert, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import ModalSelector from 'react-native-modal-selector-searchable';
import {useIsFocused} from '@react-navigation/native';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import {buttons, fonts, format} from '../style';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {format as dateFormat, parseISO} from 'date-fns';
import {LineChart} from 'react-native-chart-kit';
import HeaderBar from "../components/HeaderBar";

const ViewData = ({route, navigation}) => {
    // get current user and org info
    // determines when page comes into focus
    const isFocused = useIsFocused(),
        [selectedTest, setSelectedTest] = useState('COVID'),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        [userInfo, setUserInfo] = useState(null),
        [orgInfo, setOrgInfo] = useState(null),
        [covidTests, setCovidTests] = useState([]),
        [fibrinogenTests, setFibrinogenTests] = useState([]);

    // update user info with current authenticated user info
    // also get organization info from user, update organization info
    useEffect(() => {
        setPatientDataCOVID(null);
        setPatientKeyFibrinogen(null);
        setPatientDataCOVID(null);
        setPatientKeyFibrinogen(null);

        if (auth().currentUser != null) {
            // update user info based on database info
            database().ref('/users/' + auth().currentUser.uid).once('value',
                (userSnapshot) => {
                    if (userSnapshot.val()) {
                        setUserInfo(userSnapshot.val());
                        if (userSnapshot.val().organization === undefined) {
                            setOrgInfo(null);
                        } else
                            database().ref('/organizations/' + userSnapshot.val().organization).once('value', function (orgSnapshot) {
                                setOrgInfo(orgSnapshot.val());
                            });
                    } else {
                        setOrgInfo(null);
                    }
                });

            // get patient info for appropriate test type
            let results = null;
            if (selectedTest === 'COVID') {
                if (orgInfo === null) {
                    results = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/');
                } else {
                    results = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/');
                }
            } else if (selectedTest === 'Fibrinogen') {
                if (orgInfo === null) {
                    results = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/');
                } else {
                    results = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/');
                }
            }

            results.orderByChild('date').once('value', function (snapshot) {
                //verify that org with add code exists
                if (snapshot.val()) {
                    let temp = [];
                    // @ts-ignore
                    snapshot.forEach(function (data) {
                        temp.push({key: data.key, result: data.val().result, time: data.val().time});
                    });
                    if (selectedTest === 'COVID')
                        setCovidTests(temp.reverse());
                    else
                        setFibrinogenTests(temp.reverse());
                }
            })
        } else
            auth().signInAnonymously().then(() => {
                console.log('User signed in anonymously with uid ' + auth().currentUser.uid);
            }).catch(error => {
                console.error(error);
            });
    }, [isFocused]);

    /*

        COVID/FIBRINOGEN SELECTION BAR

     */

    const TestSelectBar = () => {
        return (
            <View style={format.testSelectBar}>
                <TouchableOpacity
                    style={(selectedTest === 'COVID') ? buttons.covidSelectButton : buttons.unselectedButton}
                    onPress={() => {
                        // change selected test and update the currently showing patient
                        setSelectedTest('COVID');
                        // get patient info for appropriate test type
                        let results = null;
                        if (selectedTest === 'COVID') {
                            if (orgInfo === null) {
                                results = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/');
                            } else {
                                results = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/');
                            }
                        } else if (selectedTest === 'Fibrinogen') {
                            if (orgInfo === null) {
                                results = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/');
                            } else {
                                results = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/');
                            }
                        }

                        results.orderByChild('date').once('value', function (snapshot) {
                            //verify that org with add code exists
                            if (snapshot.val()) {
                                let temp = [];
                                // @ts-ignore
                                snapshot.forEach(function (data) {
                                    temp.push({key: data.key, result: data.val().result, time: data.val().time});
                                });
                                if (selectedTest === 'COVID')
                                    setCovidTests(temp.reverse());
                                else
                                    setFibrinogenTests(temp.reverse());
                            }
                        })
                    }}
                >
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={(selectedTest === 'Fibrinogen') ? buttons.fibrinogenSelectButton : buttons.unselectedButton}
                    onPress={() => {
                        // change selected test and update the currently showing patient
                        setSelectedTest('Fibrinogen');

                        // get patient info for appropriate test type
                        let results = null;
                        if (selectedTest === 'COVID') {
                            if (orgInfo === null) {
                                results = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/');
                            } else {
                                results = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/');
                            }
                        } else if (selectedTest === 'Fibrinogen') {
                            if (orgInfo === null) {
                                results = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/');
                            } else {
                                results = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/');
                            }
                        }

                        results.orderByChild('date').once('value', function (snapshot) {
                            //verify that org with add code exists
                            if (snapshot.val()) {
                                let temp = [];
                                // @ts-ignore
                                snapshot.forEach(function (data) {
                                    temp.push({key: data.key, result: data.val().result, time: data.val().time});
                                });
                                if (selectedTest === 'COVID')
                                    setCovidTests(temp.reverse());
                                else
                                    setFibrinogenTests(temp.reverse());
                            }
                        })
                    }}
                >
                    <Text style={fonts.selectButtonText}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /*

        PATIENT SELECTOR AND MODAL

     */

    const PatientSelector = () => {
        const [patients, setPatients] = useState([]);
        const [viewPatientModalVisible, setViewPatientModalVisible] = useState(false);

        const toggleViewPatientModal = () => {
            // if we are re-showing this modal, update patient list in case it has changed
            // case 1: is connected to organization (covid)
            //  - look in /users/patients/covid/
            // case 2: is not connected to organization (covid)
            //  - look in /organizations/orgKey/patients/covid/
            // case 3: is connected to organization (fibrinogen)
            //  - look in /users/patients/fibrinogen/
            // case 4: is not connected to organization (fibrinogen)
            //  - look in /organizations/orgKey/patients/fibrinogen/
            if (!viewPatientModalVisible) {
                let patients = null;

                if (selectedTest === 'COVID') {
                    if (orgInfo === null) {
                        patients = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/').orderByChild('name');
                    } else {
                        patients = database().ref('/organizations/' + userInfo.organization + '/patients/covid/').orderByChild('name')
                    }
                } else if (selectedTest === 'Fibrinogen') {
                    if (orgInfo === null) {
                        patients = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/').orderByChild('name');
                    } else {
                        patients = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/').orderByChild('name')
                    }
                }

                patients.once('value', function (snapshot) {
                    if (snapshot.val()) {
                        let patientList = [];
                        snapshot.forEach(function (data) {
                            patientList.push({key: data.key, label: data.val().name});
                        });
                        setPatients(patientList);
                    }
                });
            }

            setViewPatientModalVisible(!viewPatientModalVisible);
        }

        const PatientSelectorButton = () => {
            const PatientUtilityBar = () => {
                if (selectedTest === 'COVID') {
                    if (patientDataCOVID !== null) {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create ViewData COVID')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Export</Text>
                                    <IconF
                                        name='share' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Edit ViewData COVID', {patientKey: patientKeyCOVID});
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Edit</Text>
                                    <IconA
                                        name='edit' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create ViewData COVID')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                            </View>
                        )
                    } else {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create ViewData COVID')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus'
                                        size={20}
                                        style={{color: '#eee', marginTop: 6}}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                } else if (selectedTest === 'Fibrinogen') {
                    if (patientDataFibrinogen !== null) {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create ViewData Fibrinogen')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Export</Text>
                                    <IconF
                                        name='share' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Edit ViewData Fibrinogen', {patientKey: patientKeyFibrinogen});
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>Edit</Text>
                                    <IconA
                                        name='edit' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create ViewData Fibrinogen')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus' size={20} style={{color: '#eee', marginTop: 6}}/>
                                </TouchableOpacity>
                            </View>
                        )
                    } else {
                        return (
                            <View
                                style={format.utilityPatientBarContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Create ViewData Fibrinogen')}
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: '#888',
                                        borderWidth: 1,
                                        borderRadius: 50,
                                        padding: 15,
                                        paddingTop: 3,
                                        paddingBottom: 3
                                    }}
                                >
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF
                                        name='user-plus'
                                        size={20}
                                        style={{color: '#eee', marginTop: 6}}
                                    />
                                </TouchableOpacity>
                            </View>
                        )
                    }
                }
            }
            return (
                <View>
                    <TouchableOpacity
                        onPress={() => toggleViewPatientModal()}
                        style={format.selectPatientBarContainer}
                    >
                        <Text style={fonts.username}>
                            {
                                (selectedTest === 'COVID') ?
                                    (patientDataCOVID === null) ? 'Select ViewData' : patientDataCOVID.name
                                    :
                                    (patientDataFibrinogen === null) ? 'Select ViewData' : patientDataFibrinogen.name
                            }
                        </Text>
                        <IconE style={fonts.username}
                               name={viewPatientModalVisible ? 'chevron-up' : 'chevron-down'} size={34}
                        />
                    </TouchableOpacity>
                    <PatientUtilityBar/>
                </View>
            );
        }

        return (
            <View>
                <ModalSelector
                    data={patients}
                    visible={viewPatientModalVisible}
                    onCancel={() => {
                        toggleViewPatientModal();
                    }}
                    customSelector={<View/>}
                    onChange={async (option) => {
                        // get patient ID for the appropriate test type
                        if (selectedTest === 'COVID')
                            setPatientKeyCOVID(option.key);
                        else if (selectedTest === 'Fibrinogen')
                            setPatientKeyFibrinogen(option.key);

                        // get patient info for appropriate test type
                        let patient = null;
                        let results = null;
                        if (selectedTest === 'COVID') {
                            if (orgInfo === null) {
                                results = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + option.key + '/results/');
                                patient = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + option.key);
                            } else {
                                results = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + option.key + '/results/');
                                patient = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + option.key);
                            }
                        } else if (selectedTest === 'Fibrinogen') {
                            if (orgInfo === null) {
                                results = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + option.key + '/results/');
                                patient = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + option.key);
                            } else {
                                results = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + option.key + '/results/');
                                patient = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + option.key);
                            }
                        }

                        results.orderByChild('date').once('value', function (snapshot) {
                            //verify that org with add code exists
                            if (snapshot.val()) {
                                let temp = [];
                                // @ts-ignore
                                snapshot.forEach(function (data) {
                                    temp.push({key: data.key, result: data.val().result, time: data.val().time});
                                });
                                if (selectedTest === 'COVID')
                                    setCovidTests(temp.reverse());
                                else
                                    setFibrinogenTests(temp.reverse());
                            }
                        });

                        // update data for patient for appropriate test type
                        await patient.once('value', function (patientSnapshot) {
                            if (selectedTest === 'COVID') {
                                setPatientKeyCOVID(patientSnapshot.key);
                                setPatientDataCOVID(patientSnapshot.val());
                            } else if (selectedTest === 'Fibrinogen') {
                                setPatientKeyFibrinogen(patientSnapshot.key);
                                setPatientDataFibrinogen(patientSnapshot.val());
                            }
                        });
                    }}
                    optionContainerStyle={{
                        backgroundColor: '#111',
                        border: 0
                    }}
                    optionTextStyle={{
                        color: '#444',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }}
                    optionStyle={{
                        padding: 20,
                        backgroundColor: '#eee',
                        borderRadius: 100,
                        margin: 5,
                        marginBottom: 15,
                        borderColor: '#222'
                    }}
                    cancelText={'Cancel'}
                    cancelStyle={styles.cancelButton}
                    cancelTextStyle={styles.testButtonText}
                    searchStyle={{padding: 25, marginBottom: 30, backgroundColor: '#ccc'}}
                    searchTextStyle={{padding: 15, fontSize: 18, color: '#222'}}
                    listType={'FLATLIST'}
                />
                <PatientSelectorButton/>
            </View>
        );
    }

    /*

        COVID TEST RESULTS

     */

    const COVIDTests = () => {
        let CovidListItemView = (props) => {
            const [item, setItem] = useState(props.item);

            useEffect(() => {
                setItem(props.item);
            }, [props.item]);

            const databaseDelete = (testKey) => {
                let testResult = null;

                if (orgInfo === null) {
                    testResult = database().ref('/users/' + auth().currentUser.uid + '/patients/covid/' + patientKeyCOVID + '/results/' + testKey);
                } else {
                    testResult = database().ref('/organizations/' + userInfo.organization + '/patients/covid/' + patientKeyCOVID + '/results/' + testKey);
                }

                testResult.remove();
            }

            const animatedDelete = () => {
                Alert.alert(
                    "Are your sure?",
                    "This will permanently delete the test result",
                    [
                        {
                            text: "Cancel"
                        },
                        {
                            text: "Confirm",
                            onPress: () => {
                                databaseDelete(item.key);
                                const height = new Animated.Value(70);
                                Animated.timing(height, {
                                    toValue: 0,
                                    duration: 350,
                                    useNativeDriver: false
                                }).start(() => setCovidTests(prevState => prevState.filter(e => e.key !== item.key)))
                            },
                        },
                    ]
                );
            }

            const swipeRight = (progress, dragX) => {
                const scale = dragX.interpolate({
                    inputRange: [-200, 0],
                    outputRange: [1, 0.5],
                    extrapolate: 'clamp'
                })
                return (
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'red',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                        onPress={animatedDelete}
                    >
                        <Animated.View style={{backgroundColor: 'red', justifyContent: 'center'}}>
                            <Animated.Text
                                style={{
                                    marginLeft: 25,
                                    marginRight: 25,
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                    transform: [{scale}],
                                    color: '#fff'
                                }}
                            >
                                Delete
                            </Animated.Text>
                        </Animated.View>
                    </TouchableOpacity>
                )
            }

            return (
                <View>
                    <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                        <Animated.View
                            style={{flex: 1, paddingLeft: 20, paddingRight: 20, marginTop: 20, marginBottom: 20}}>
                            <View
                                style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}
                            >
                                <View style={{
                                    backgroundColor: '#353535',
                                    padding: 20,
                                    paddingBottom: 10,
                                    flex: 1,
                                    borderTopLeftRadius: 15,
                                    borderTopRightRadius: 15
                                }}>
                                    <Text
                                        style={fonts.mediumText}>{dateFormat(parseISO(item.time), 'MMM d @ hh:mm:ss aaaa')}</Text>
                                </View>
                                <View style={{padding: 20}}>
                                    <Text
                                        style={fonts.mediumText}>{(item.result !== undefined && item.result === 0) ? 'Negative' : 'Positive'}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </Swipeable>
                </View>
            );
        }

        return (
            <View>
                <View style={{alignItems: 'center', justifyContent: 'center', padding: 20}}>
                    <Text style={styles.headingText}>Test Results</Text>
                    {(covidTests.length === 0) &&
                    <Text style={{
                        color: '#fff',
                        paddingTop: 6,
                        fontSize: 18,
                        textAlign: 'center'
                    }}>No test results have been recorded yet</Text>
                    }
                </View>
                {covidTests.map(test => {
                    return <CovidListItemView key={test.key} item={test}/>
                })}
            </View>
        );
    }

    /*

        FIBRINOGEN TEST RESULTS

     */

    const FibrinogenTests = () => {
        const screenWidth = Dimensions.get('window').width;

        const chartConfig = {
            backgroundGradientFrom: "#111",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#222",
            backgroundGradientToOpacity: 0.2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        };

        const [chartData, setChartData] = useState({
            labels: ['0'],
            datasets: [{
                data: [0]
            }]
        });

        const emptyChartData = {
            labels: ['0'],
            datasets: [{
                data: [0]
            }]
        };

        useEffect(() => {
            let tempLabels = [], tempDatasets = [];
            for (let fibTest of fibrinogenTests) {
                tempLabels.push(dateFormat(parseISO(fibTest.time), 'MMM d'));
                tempDatasets.push(fibTest.result);
            }

            setChartData({
                labels: tempLabels.reverse(),
                datasets: [{
                    data: tempDatasets.reverse()
                }]
            })

        }, []);

        let FibrinogenTestItem = (props) => {
            const [item, setItem] = useState(props.item);

            const databaseDelete = (testKey) => {
                let testResult = null;

                if (orgInfo === null) {
                    testResult = database().ref('/users/' + auth().currentUser.uid + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/' + testKey);
                } else {
                    testResult = database().ref('/organizations/' + userInfo.organization + '/patients/fibrinogen/' + patientKeyFibrinogen + '/results/' + testKey);
                }

                testResult.remove();
            }

            const animatedDelete = () => {
                Alert.alert(
                    "Are your sure?",
                    "This will permanently delete the test result",
                    [
                        {
                            text: "Cancel"
                        },
                        {
                            text: "Confirm",
                            onPress: () => {
                                databaseDelete(item.key);
                                const height = new Animated.Value(70);
                                Animated.timing(height, {
                                    toValue: 0,
                                    duration: 350,
                                    useNativeDriver: false
                                }).start(() => setFibrinogenTests(prevState => prevState.filter(e => e.key !== item.key)))
                            },
                        },
                    ]
                );
            }

            const swipeRight = (progress, dragX) => {
                const scale = dragX.interpolate({
                    inputRange: [-200, 0],
                    outputRange: [1, 0.5],
                    extrapolate: 'clamp'
                })
                return (
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'red',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                        onPress={animatedDelete}
                    >
                        <Animated.View style={{backgroundColor: 'red', justifyContent: 'center'}}>
                            <Animated.Text
                                style={{
                                    marginLeft: 25,
                                    marginRight: 25,
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                    transform: [{scale}],
                                    color: '#fff'
                                }}
                            >
                                Delete
                            </Animated.Text>
                        </Animated.View>
                    </TouchableOpacity>
                )
            }

            return (
                <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                    <Animated.View
                        style={{flex: 1, paddingLeft: 20, paddingRight: 20, marginTop: 20, marginBottom: 20}}>
                        <View
                            style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}
                        >
                            <View style={{
                                backgroundColor: '#353535',
                                padding: 20,
                                paddingBottom: 10,
                                flex: 1,
                                borderTopLeftRadius: 15,
                                borderTopRightRadius: 15
                            }}>
                                <Text
                                    style={fonts.mediumText}>{dateFormat(parseISO(item.time), 'MMM d @ hh:mm:ss aaaa')}</Text>
                            </View>
                            <View style={{padding: 20}}>
                                <Text style={fonts.mediumText}>{item.result} mg/ml</Text>
                            </View>
                        </View>
                    </Animated.View>
                </Swipeable>
            );
        }

        return (
            <View>
                <View style={{alignItems: 'center', justifyContent: 'center', padding: 20}}>
                    <Text style={styles.headingText}>Test Results</Text>
                    {fibrinogenTests.length === 0 &&
                    <Text style={{
                        color: '#fff',
                        paddingTop: 6,
                        fontSize: 18,
                        textAlign: 'center'
                    }}>
                        No test results have been recorded yet
                    </Text>
                    }
                </View>
                {chartData !== null &&
                <View style={{flex: 0.6, padding: 15}}>
                    <LineChart
                        data={(chartData.labels.length === 0) ? emptyChartData : chartData}
                        width={screenWidth} // from react-native
                        height={400}
                        chartConfig={chartConfig}
                        withInnerLines={false}
                        withOuterLines={false}
                        bezier
                    />
                </View>
                }
                {fibrinogenTests.map(test => {
                    return <FibrinogenTestItem key={test.key} item={test}/>
                })}
            </View>
        );
    }

    /*

        PATIENT PORTAL FOR COVID AND FIBRINOGEN

     */

    const PatientPortal = () => {

        // patient has been selected
        if (patientKeyCOVID != null && patientDataCOVID != null && selectedTest === 'COVID')
            return (
                <View>
                    <View>
                        {(patientDataCOVID.email !== undefined || patientDataCOVID.phone !== undefined) ?
                            <View style={{
                                margin: 20,
                                marginTop: 5,
                                marginBottom: 5,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#444',
                                padding: 5,
                                paddingLeft: 20,
                                paddingRight: 20,
                            }}>
                                <Text style={styles.sectionText}>Email</Text>
                                {(patientDataCOVID.email !== undefined) ?
                                    <Text
                                        style={styles.text}>
                                        {patientDataCOVID.email}
                                    </Text>
                                    :
                                    <View/>
                                }
                            </View>
                            :
                            <View/>
                        }
                    </View>
                    {(patientDataCOVID.email !== undefined || patientDataCOVID.phone !== undefined) ?
                        <View style={{
                            margin: 20,
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#444',
                            padding: 5,
                            paddingLeft: 20,
                            paddingRight: 20,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={styles.sectionText}>Phone</Text>
                            {(patientDataCOVID.phone !== undefined) ?
                                <Text style={styles.text}>
                                    {patientDataCOVID.phone}
                                </Text>
                                :
                                <View/>
                            }
                        </View>
                        :
                        <View/>
                    }
                    <COVIDTests/>
                </View>
            );
        else if (patientKeyFibrinogen != null && patientDataFibrinogen != null && selectedTest === 'Fibrinogen') return (
            <View>
                <View>
                    {(patientDataFibrinogen.bloodType !== undefined) ?
                        (
                            <View style={{
                                margin: 20,
                                marginTop: 5,
                                marginBottom: 5,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#444',
                                padding: 5,
                                paddingLeft: 20,
                                paddingRight: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <Text style={styles.sectionText}>Blood Type</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.bloodType}</Text>
                            </View>
                        )
                        :
                        <View/>
                    }
                    {(patientDataFibrinogen.sex !== undefined) ?
                        (
                            <View style={{
                                margin: 20,
                                marginTop: 5,
                                marginBottom: 5,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#444',
                                padding: 5,
                                paddingLeft: 20,
                                paddingRight: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <Text style={styles.sectionText}>Sex</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.sex}</Text>
                            </View>
                        )
                        :
                        <View/>
                    }
                    {(patientDataFibrinogen.age !== undefined) ?
                        (
                            <View style={{
                                margin: 20,
                                marginTop: 5,
                                marginBottom: 5,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#444',
                                padding: 5,
                                paddingLeft: 20,
                                paddingRight: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <Text style={styles.sectionText}>Age</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.age}</Text>
                            </View>
                        )
                        :
                        <View/>
                    }
                    {(patientDataFibrinogen.weight !== undefined) ?
                        (
                            <View style={{
                                margin: 20,
                                marginTop: 5,
                                marginBottom: 5,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#444',
                                padding: 5,
                                paddingLeft: 20,
                                paddingRight: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <Text style={styles.sectionText}>Weight</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.weight}</Text>
                            </View>
                        )
                        :
                        <View/>
                    }
                    {(patientDataFibrinogen.height !== undefined) ?
                        (
                            <View style={{
                                margin: 20,
                                marginTop: 5,
                                marginBottom: 5,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#444',
                                padding: 5,
                                paddingLeft: 20,
                                paddingRight: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }}>
                                <Text style={styles.sectionText}>Height</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.height}</Text>
                            </View>
                        )
                        :
                        <View/>
                    }
                    <FibrinogenTests/>
                </View>
            </View>
        );
        else // patient has not yet been selected
            return (
                <View style={{padding: 25, paddingTop: 150, paddingBottom: 50}}>
                    <Text style={fonts.heading}>To view a patient portal, select the test type and the patient or scan
                        their QR code</Text>
                </View>
            );
    }

    return (
        <SafeAreaView style={format.page}>
            <HeaderBar navigation={navigation}/>
            <TestSelectBar/>
            <PatientSelector/>
            <ScrollView>
                <PatientPortal/>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-around'
    },
    section: {
        flexDirection: 'row',
    },
    nameContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flex: 1,
        flexDirection: 'row'
    },
    nameText: {
        fontSize: 36,
        color: '#fff',
        textAlign: 'left',
        fontWeight: 'bold',
        flex: 1
    },
    sectionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'left',
        paddingTop: 4,
        paddingBottom: 4,
    },
    text: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'left',
        paddingTop: 4,
        paddingBottom: 4,
    },
    infoText: {
        fontSize: 18,
        color: '#fff',
    },
    headingContainer: {
        backgroundColor: '#ccc',
        textAlign: 'left',
    },
    headingText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    infoContainer: {
        margin: 10,
    },
    subheadingText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'left',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
    }
});

export default ViewData;