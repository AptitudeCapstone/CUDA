import React, {useEffect, useState} from 'react';
import {Alert, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import ModalSelector from 'react-native-modal-selector-searchable';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import {buttons, fonts, format, modal} from '../style';
import database from '@react-native-firebase/database';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {format as dateFormat, parseISO} from 'date-fns';
import {LineChart} from 'react-native-chart-kit';
import HeaderBar from "../components/HeaderBar";
import {useUserAuth} from "../contexts/UserContext";

const ViewData = ({navigation}) => {
    const [selectedTest, setSelectedTest] = useState('covid'),
        [patientsForSelectedTest, setPatientsForSelectedTest] = useState([]),
        //[fibrinogenPatients, setFibrinogenPatients] = useState([]),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        [patientCOVIDTests, setPatientCOVIDTests] = useState([]),
        [patientFibrinogenTests, setPatientFibrinogenTests] = useState([]),
        [viewPatientModalVisible, setViewPatientModalVisible] = useState(false),
        screenWidth = Dimensions.get('window').width,
        [chartData, setChartData] = useState({labels: ['0'], datasets: [{data: [0]}]}),
        chartConfig = {
            backgroundGradientFrom: "#111",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#222",
            backgroundGradientToOpacity: 0.2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        };

    const userInfo = useUserAuth();
    const userAuth = userInfo.userAuth;
    const userData = userInfo.user;
    const userStatus = userInfo.user.status;

    console.log(userInfo.subscriptions);

    const patientsPath = () =>
            ((userData.organization === undefined
                ? '/users/' + userAuth.uid
                : '/organizations/' + userData.organization)
            + '/patients/'),
        patientTestPath = (testType, testKey) =>
            testType + '/' + (testType === 'covid' ? patientKeyCOVID : patientKeyFibrinogen) + '/results/' + testKey,
        testDBRef = (testType, testKey) =>
            database().ref(patientsPath() + patientTestPath(testType, testKey)),
        databaseDelete = (testType, testKey) =>
            testDBRef(testType, testKey).remove()
                .then(() => console.log('entry removed'))
                .catch(() => {throw new Error('problem removing item from database')});

    const showAllResultsForTest = (testType) => {
        database().ref(patientsPath()).once('value', (patientsSnapshot) => {
            console.log('patients path:', patientsPath());
            console.log('patients for current user: ', JSON.stringify(patientsSnapshot.val(), null, 2));
        });
    }

    // if logging out or changing organization, we need to unsubscribe from updates on the DB
    // and subscribe to updates of new user
    useEffect(() => {
        if(userStatus !== 'registered-user-signed-in' && userStatus !== 'anonymous-signed-in') {
            return;
        }

        return database().ref(patientsPath()).on('value',
            (patientsSnapshot) => {
                if (patientsSnapshot.exists()) {
                    // display list of all patients
                    console.log('Patients for current user / organization: ', JSON.stringify(patientsSnapshot.val(), null, 2));
                } else {
                    console.log('Patients database entry not found or is empty');

                }
            },
            (error) => {
                console.log('Error occurred while fetching database updates:', error)
            }
        );
    }, [userAuth, userData.organization, userStatus]);

    //

    const selectedPatientChanged = (patientOption) => console.log('selected patient' + patientOption);

    const scale = (dragX) => dragX.interpolate({inputRange: [-200, 0],  outputRange: [1, 0.5],  extrapolate: 'clamp'});

    const animatedDelete = (testType, item) =>
        Alert.alert("Are your sure?", "This will permanently delete the test result", [
            {text: "Cancel"},
            {
                text: "Confirm",
                onPress: () => {
                    databaseDelete(testType, item.key)
                        .then(() => {
                            Animated.timing(new Animated.Value(70), {toValue: 0, duration: 350, useNativeDriver: false})
                                .start(() => {
                                    if (testType === 'fibrinogen')
                                        setPatientFibrinogenTests(prevState => prevState.filter(e => e.key !== item.key));
                                    else if (testType === 'covid')
                                        setPatientCOVIDTests(prevState => prevState.filter(e => e.key !== item.key));
                                })
                        })
                        .catch((error) => {
                            Alert.alert('Error', error.message);
                        });
                }
            }]);

    const COVIDTest = (props) => {
        const {item, key} = props;

        const swipeRightAction = (progress, dragX) => (
            <TouchableOpacity
                style={{backgroundColor: 'red', justifyContent: 'center', textAlign: 'center',}}
                onPress={() => animatedDelete('covid', item)}>
                <Animated.View style={{backgroundColor: 'red', justifyContent: 'center'}}>
                    <Animated.Text style={[buttons.animatedText, {transform: [scale(dragX)]}]}>
                        Delete
                    </Animated.Text>
                </Animated.View>
            </TouchableOpacity>
        );

        return (
            <Swipeable renderRightActions={swipeRightAction} rightThreshold={-200}>
                <Animated.View style={{flex: 1, paddingLeft: 20, paddingRight: 20, marginTop: 20, marginBottom: 20}}>
                    <View style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}>
                        <View style={{backgroundColor: '#353535', padding: 20, paddingBottom: 10,
                            flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                            <Text style={fonts.mediumText}>
                                {dateFormat(parseISO(item.time), 'MMM d @ hh:mm:ss aaaa')}
                            </Text>
                        </View>
                        <Text style={[fonts.mediumText, {padding: 20}]}>
                            {(item.result !== undefined && item.result === 0) ? 'Negative' : 'Positive'}
                        </Text>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    }

    const FibrinogenTest = (props) => {
        const {item, key} = props;

        const swipeRightAction = (progress, dragX) => (
            <TouchableOpacity
                style={{backgroundColor: 'red', justifyContent: 'center', textAlign: 'center',}}
                onPress={() => animatedDelete('fibrinogen', item)}>
                <Animated.View style={{backgroundColor: 'red', justifyContent: 'center'}}>
                    <Animated.Text style={[buttons.animatedText, {transform: [scale(dragX)]}]}>
                        Delete
                    </Animated.Text>
                </Animated.View>
            </TouchableOpacity>
        );

        return (
            <Swipeable renderRightActions={swipeRightAction} rightThreshold={-200}>
                <Animated.View  style={{flex: 1, paddingLeft: 20, paddingRight: 20, marginTop: 20, marginBottom: 20}}>
                    <View style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}>
                        <View style={{backgroundColor: '#353535', padding: 20, paddingBottom: 10,
                            flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                            <Text style={fonts.mediumText}>
                                {dateFormat(parseISO(item.time), 'MMM d @ hh:mm:ss aaaa')}
                            </Text>
                        </View>
                        <Text style={[fonts.mediumText, {padding: 20}]}>
                            {item.result} mg/ml
                        </Text>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    }

    const toggleViewPatientModal = () => setViewPatientModalVisible(!viewPatientModalVisible);

    return (
        <SafeAreaView style={format.page}>
            <HeaderBar navigation={navigation} />
            <View style={format.testSelectBar}>
                <TouchableOpacity onPress={() => setSelectedTest('covid')}
                    style={(selectedTest === 'covid') ? buttons.covidSelectButton : buttons.unselectedButton}>
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTest('fibrinogen')}
                    style={(selectedTest === 'fibrinogen') ? buttons.fibrinogenSelectButton : buttons.unselectedButton}>
                    <Text style={fonts.selectButtonText}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
            <ModalSelector
                onChange={(option) => {selectedPatientChanged(option)}}
                renderItem={<View />}
                customSelector={<View />}
                visible={viewPatientModalVisible}
                data={patientsForSelectedTest}
                onCancel={() => toggleViewPatientModal()}
                cancelText={'Cancel'}
                searchText={'Search patient by name'}
                overlayStyle={modal.overlay}
                optionContainerStyle={modal.container}
                optionTextStyle={modal.optionText}
                optionStyle={modal.option}
                cancelStyle={modal.cancelOption}
                cancelTextStyle={modal.cancelText}
                searchStyle={modal.searchBar}
                initValueTextStyle={modal.searchText}
                searchTextStyle={modal.searchText}
            />
            <TouchableOpacity onPress={() => toggleViewPatientModal()}
                              style={format.selectPatientBarContainer}>
                <Text style={fonts.username}>
                    {
                        (selectedTest === 'covid') ?
                            (patientDataCOVID === null) ? 'Select Patient' : patientDataCOVID.name
                            :
                            (patientDataFibrinogen === null) ? 'Select Patient' : patientDataFibrinogen.name
                    }
                </Text>
                <IconE style={fonts.username} size={34}
                       name={viewPatientModalVisible ? 'chevron-up' : 'chevron-down'} />
            </TouchableOpacity>
            {
                (selectedTest === 'covid' && patientDataCOVID !== null) &&
                <View style={format.utilityPatientBarContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Create Patient COVID')}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>Export</Text>
                        <IconF name='share' size={20} style={{color: '#eee', marginTop: 6}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Edit Patient COVID', {patientKey: patientKeyCOVID})}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>Edit</Text>
                        <IconA name='edit' size={20} style={{color: '#eee', marginTop: 6}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Create Patient COVID')}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>New</Text>
                        <IconF  name='user-plus' size={20} style={{color: '#eee', marginTop: 6}}/>
                    </TouchableOpacity>
                </View>
            }
            {
                (selectedTest === 'covid' && patientDataCOVID === null) &&
                <View style={format.utilityPatientBarContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Create Patient COVID')}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>New</Text>
                        <IconF name='user-plus' size={20} style={{color: '#eee', marginTop: 6}} />
                    </TouchableOpacity>
                </View>
            }
            {
                (selectedTest === 'fibrinogen' && patientDataCOVID !== null) &&
                <View style={format.utilityPatientBarContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Create Patient Fibrinogen')}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>Export</Text>
                        <IconF  name='share' size={20} style={{color: '#eee', marginTop: 6}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Edit Patient Fibrinogen', {patientKey: patientKeyFibrinogen});
                        }}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>Edit</Text>
                        <IconA  name='edit' size={20} style={{color: '#eee', marginTop: 6}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Create Patient Fibrinogen')}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>New</Text>
                        <IconF  name='user-plus' size={20} style={{color: '#eee', marginTop: 6}}/>
                    </TouchableOpacity>
                </View>
            }
            {
                (selectedTest === 'fibrinogen' && patientDataCOVID === null) &&
                <View style={format.utilityPatientBarContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Create Patient Fibrinogen')}
                        style={format.utilityBarButton}>
                        <Text style={fonts.mediumText}>New</Text>
                        <IconF name='user-plus' size={20} style={{color: '#eee', marginTop: 6}} />
                    </TouchableOpacity>
                </View>
            }
            <ScrollView>
                {   // covid patient has been selected
                    (patientKeyCOVID !== null && patientDataCOVID !== null && selectedTest === 'covid') &&
                    <>
                        {
                            (patientDataCOVID.email !== undefined || patientDataCOVID.phone !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Email</Text>
                                {
                                    (patientDataCOVID.email !== undefined) &&
                                    <Text style={styles.text}>
                                        {patientDataCOVID.email}
                                    </Text>
                                }
                            </View>
                        }
                        {
                            (patientDataCOVID.email !== undefined || patientDataCOVID.phone !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Phone</Text>
                                {
                                    (patientDataCOVID.phone !== undefined) &&
                                    <Text style={styles.text}>
                                        {patientDataCOVID.phone}
                                    </Text>
                                }
                            </View>
                        }
                        <View style={{alignItems: 'center', justifyContent: 'center', padding: 20}}>
                            <Text style={styles.headingText}>Test Results</Text>
                            {
                                (patientCOVIDTests.length === 0) &&
                                <Text style={{color: '#fff', paddingTop: 6, fontSize: 18, textAlign: 'center'}}>
                                    No test results have been recorded yet
                                </Text>
                            }
                        </View>
                        {
                            patientCOVIDTests.map(test => <COVIDTest key={test.key} item={test}/>)
                        }
                    </>
                }
                {   // fibrinogen patient selected
                    (patientKeyFibrinogen !== null && patientDataFibrinogen !== null && selectedTest === 'fibrinogen') &&
                    <>
                        {
                            (patientDataFibrinogen.bloodType !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Blood Type</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.bloodType}</Text>
                            </View>
                        }
                        {
                            (patientDataFibrinogen.sex !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Sex</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.sex}</Text>
                            </View>

                        }
                        {
                            (patientDataFibrinogen.age !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Age</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.age}</Text>
                            </View>
                        }
                        {
                            (patientDataFibrinogen.weight !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Weight</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.weight}</Text>
                            </View>
                        }
                        {
                            (patientDataFibrinogen.height !== undefined) &&
                            <View style={styles.patientField}>
                                <Text style={styles.sectionText}>Height</Text>
                                <Text style={styles.text}>{patientDataFibrinogen.height}</Text>
                            </View>

                        }
                        <View style={{alignItems: 'center', justifyContent: 'center', padding: 20}}>
                            <Text style={styles.headingText}>Test Results</Text>
                            {
                                (patientFibrinogenTests.length === 0) &&
                                <Text style={{color: '#fff',  paddingTop: 6, fontSize: 18, textAlign: 'center'}}>
                                    No test results have been recorded yet
                                </Text>
                            }
                        </View>
                        {
                            (chartData !== null) &&
                            <View style={{flex: 0.6, padding: 15}}>
                                <LineChart
                                    data={chartData}
                                    width={screenWidth}
                                    height={400}
                                    chartConfig={chartConfig}
                                    withInnerLines={false}
                                    withOuterLines={false}
                                />
                            </View>
                        }
                        {
                            patientFibrinogenTests.map(test => <FibrinogenTest key={test.key} item={test} />)
                        }
                    </>
                }
                {   // no patient selection yet
                    (patientKeyFibrinogen != null && patientDataFibrinogen != null) &&
                    <Text style={[fonts.heading, {padding: 25, paddingTop: 150, paddingBottom: 50}]}>
                        To view a patient portal, select the test type and the patient or scan their QR code
                    </Text>
                }
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    patientField: {
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
    },
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