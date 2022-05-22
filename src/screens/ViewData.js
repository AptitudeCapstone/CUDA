import React, {useEffect, useState} from 'react';
import {Alert, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import ModalSelector from 'react-native-modal-selector';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import {buttons, fonts, format, modal, chartConfig, darkText} from '../style';
import database from '@react-native-firebase/database';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {format as dateFormat, parseISO} from 'date-fns';
import {LineChart} from 'react-native-chart-kit';
import UserBar from "../components/UserBar";
import useAuth from "../contexts/UserContext";
import {useIsFocused} from '@react-navigation/native';

const ViewData = ({navigation}) => {
    const isFocused = useIsFocused(),
        [selectedTest, setSelectedTest] = useState('covid'),
        [patientKeyCOVID, setPatientKeyCOVID] = useState(null),
        [patientKeyFibrinogen, setPatientKeyFibrinogen] = useState(null),
        [patientDataCOVID, setPatientDataCOVID] = useState(null),
        [patientDataFibrinogen, setPatientDataFibrinogen] = useState(null),
        [patients, setPatients] = useState(() => new Map()),
        [covidPatients, setCovidPatients] = useState([]),
        [fibrinogenPatients, setFibrinogenPatients] = useState([]),
        [patientCOVIDTests, setPatientCOVIDTests] = useState([]),
        [patientFibrinogenTests, setPatientFibrinogenTests] = useState([]),
        [viewPatientModalVisible, setViewPatientModalVisible] = useState(false),
        screenWidth = Dimensions.get('window').width,
        [chartData, setChartData] = useState({labels: ['0'], datasets: [{data: [0]}]}),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        loginStatus = userInfo.loginStatus,
        organization = userInfo.user?.organization,
        patientsPath = (organization ? '/organizations/' + organization + '/patients/' : '/users/' + auth?.uid),
        patientsRef = database().ref(patientsPath),
        patientTestsPath = ((selectedTest === 'covid')
                ? patientsPath + '/covid-patients/results/'
                : patientsPath + '/fibrinogen-patients/results/'),
        patientTestDBRef = (testKey) => database().ref(patientTestsPath + testKey),
        databaseDelete = (testKey) =>
            patientTestDBRef(testKey).remove()
                .then(() => console.log('entry removed'))
                .catch(() => {
                    throw new Error('problem removing item from database')
                })

    useEffect(() => {
        if (!auth) {
            setCovidPatients([]);
            setFibrinogenPatients([]);
            return;
        }

        patientsRef.on('value',
            (patientsSnapshot) => {
                if (patientsSnapshot.exists()) {
                    const p = patientsSnapshot.toJSON();
                    setPatients(p);
                    if (p && p['covid-patients']) {
                        const c = Object.keys(p['covid-patients']).map((k) => [k, p['covid-patients'][k]]);
                        setCovidPatients(c);
                    }
                    if (p && p['fibrinogen-patients']) {
                        const f = Object.keys(p['fibrinogen-patients']).map((k) => [k, p['fibrinogen-patients'][k]]);
                        setFibrinogenPatients(f)
                    }
                } else {
                    setCovidPatients([]);
                    setFibrinogenPatients([]);
                }
            },
            (error) => console.error('Error fetching database updates:', error)
        );

        return () => patientsRef.off();
    }, [auth, organization, loginStatus, selectedTest, isFocused]);

    const selectedPatientChanged = (patientKey) => {
        if (selectedTest === 'covid') {
            setPatientDataCOVID(patients['covid-patients'][patientKey]);
            setPatientKeyCOVID(patientKey);
            console.log('all covid patients:', covidPatients);
        } else if (selectedTest === 'fibrinogen') {
            setPatientDataFibrinogen(patients['fibrinogen-patients'][patientKey]);
            setPatientKeyFibrinogen(patientKey);
        }
    }

    const scale = (dragX) => dragX.interpolate({inputRange: [-200, 0], outputRange: [1, 0.5], extrapolate: 'clamp'});

    const animatedDelete = (item) =>
        Alert.alert("Are your sure?", "This will permanently delete the test result", [
            {text: "Cancel"},
            {
                text: "Confirm",
                onPress: () => {
                    databaseDelete(item.key).then(() => {
                        Animated.timing(new Animated.Value(70), {toValue: 0, duration: 350, useNativeDriver: false})
                            .start(() => {
                                if (selectedTest === 'fibrinogen')
                                    setPatientFibrinogenTests(prevState => prevState.filter(e => e.key !== item.key));
                                else if (selectedTest === 'covid')
                                    setPatientCOVIDTests(prevState => prevState.filter(e => e.key !== item.key));
                            })
                    }).catch((error) => Alert.alert('Error', error.message));
                }
            }]);

    const COVIDTest = (props) => {
        const {item, key} = props;

        const swipeRightAction = (progress, dragX) => (
            <TouchableOpacity
                style={{backgroundColor: 'red', justifyContent: 'center', textAlign: 'center',}}
                onPress={() => animatedDelete(item)}>
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
                        <View style={{
                            backgroundColor: '#353535', padding: 20, paddingBottom: 10,
                            flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15
                        }}>
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
            <TouchableOpacity onPress={() => animatedDelete(item)}
                              style={{backgroundColor: 'red', justifyContent: 'center', textAlign: 'center',}}>
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
                        <View style={{
                            backgroundColor: '#353535', padding: 20, paddingBottom: 10,
                            flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15
                        }}>
                            <Text style={fonts.mediumText}>
                                {dateFormat(parseISO(item.time), 'MMM d @ hh:mm:ss aaaa')}
                            </Text>
                        </View>
                        <Text style={[fonts.mediumText, {padding: 20}]}>{item.result} mg/ml</Text>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    }

    const toggleViewPatientModal = () => setViewPatientModalVisible(!viewPatientModalVisible);

    const isCOVIDTest = patientKeyCOVID && patientDataCOVID && selectedTest === 'covid';
    const isFibrinogenTest = patientKeyFibrinogen && patientDataFibrinogen && selectedTest === 'fibrinogen';

    return (
        <SafeAreaView style={[format.safeArea, {backgroundColor: '#fff'}]}>
                <View style={format.testSelectBar}>
                    <TouchableOpacity onPress={() => setSelectedTest('covid')}
                                      style={(selectedTest === 'covid')
                                          ? buttons.covidSelectButton
                                          : buttons.unselectedButton}>
                        <Text style={fonts.selectButtonText}>COVID</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTest('fibrinogen')}
                                      style={(selectedTest === 'fibrinogen')
                                          ? buttons.fibrinogenSelectButton
                                          : buttons.unselectedButton}>
                        <Text style={fonts.selectButtonText}>Fibrinogen</Text>
                    </TouchableOpacity>
                </View>
                <ModalSelector
                    onChange={(option) => selectedPatientChanged(option[0])}
                    renderItem={<View/>}
                    customSelector={<View/>}
                    visible={viewPatientModalVisible}
                    data={(selectedTest === 'covid' ? covidPatients : fibrinogenPatients)}
                    keyExtractor={patient => patient[0]}
                    labelExtractor={patient => patient[1]['name']}
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
                />
            <View style={[format.page, {backgroundColor: '#eee'}]}>
                <TouchableOpacity onPress={() => toggleViewPatientModal()}
                                  style={format.selectPatientBarContainer}>
                    <Text style={fonts.bigText}>
                        {(selectedTest === 'covid') ?
                            (patientKeyCOVID) ? patientDataCOVID.name : 'Patient' :
                            (patientKeyFibrinogen) ? patientDataFibrinogen.name : 'Select Patient'}
                    </Text>
                    <IconE style={fonts.bigText} size={34}
                           name={viewPatientModalVisible ? 'chevron-up' : 'chevron-down'}/>
                </TouchableOpacity>

                {
                    (selectedTest === 'covid' && patientDataCOVID !== null) &&
                        <>
                    <View style={format.utilityPatientBarContainer}>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => navigation.navigate('Create Patient COVID')}>
                            <Text style={fonts.mediumText}>Export</Text>
                            <IconF name='share' size={20} style={format.utilityBarButtonIcon}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => navigation.navigate('Edit Patient COVID',
                                              {patientKey: patientKeyCOVID})}>
                            <Text style={fonts.mediumText}>Edit</Text>
                            <IconA name='edit' size={20} style={format.utilityBarButtonIcon}/>
                        </TouchableOpacity>
                    </View>
                            <View style={format.utilityPatientBarContainer}>
                                <TouchableOpacity style={format.utilityBarButton}
                                                  onPress={() => navigation.navigate('Create Patient COVID')}>
                                    <Text style={fonts.mediumText}>Export</Text>
                                    <IconF name='share' size={20} style={{color: '#555', alignSelf: 'center'}}/>
                                </TouchableOpacity>
                                <TouchableOpacity style={format.utilityBarButton}
                                                  onPress={() => navigation.navigate('Edit Patient COVID',
                                                      {patientKey: patientKeyCOVID})}>
                                    <Text style={fonts.mediumText}>Edit</Text>
                                    <IconA name='edit' size={20} style={format.utilityBarButtonIcon}/>
                                </TouchableOpacity>
                            </View>
                    </>
                }
                {
                    (selectedTest === 'covid' && patientDataCOVID === null) &&
                    <View style={format.utilityPatientBarContainer}>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => navigation.navigate('Create Patient COVID')}>
                            <Text style={fonts.mediumText}>New</Text>
                            <IconF name='user-plus' size={20} style={{color: '#555', marginTop: 6}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.utilityBarButton}>
                            <Text style={fonts.mediumText}>Scan QR</Text>
                            <IconF name='user-plus' size={20} style={format.utilityBarButtonIcon}/>
                        </TouchableOpacity>
                    </View>
                }
                {
                    (selectedTest === 'fibrinogen' && patientDataFibrinogen !== null) &&
                        <>
                            <View style={format.utilityPatientBarContainer}>
                                <TouchableOpacity style={format.utilityBarButton}
                                                  onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                                    <Text style={fonts.mediumText}>New</Text>
                                    <IconF name='user-plus' size={20} style={{color: '#555', marginTop: 6}}/>
                                </TouchableOpacity>
                                <TouchableOpacity style={format.utilityBarButton}>
                                    <Text style={fonts.mediumText}>Scan QR</Text>
                                    <IconMCI name='qrcode-scan' size={20} style={{color: '#555', alignSelf: 'center'}}/>
                                </TouchableOpacity>
                            </View>
                    <View style={format.utilityPatientBarContainer}>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                            <Text style={fonts.mediumText}>Export</Text>
                            <IconF name='share' size={20} style={{color: '#555', alignSelf: 'center'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => {
                                              navigation.navigate('Edit Patient Fibrinogen',
                                                  {patientKey: patientKeyFibrinogen})}}>
                            <Text style={fonts.mediumText}>Edit</Text>
                            <IconA name='edit' size={20} style={{color: '#555', alignSelf: 'center'}}/>
                        </TouchableOpacity>
                    </View>
                    </>
                }
                {
                    (selectedTest === 'fibrinogen' && patientDataFibrinogen === null) &&
                    <View style={format.utilityPatientBarContainer}>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                            <Text style={fonts.mediumText}>New</Text>
                            <IconF name='user-plus' size={20} style={{color: '#555', marginTop: 6}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={format.utilityBarButton}
                                          onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                            <Text style={fonts.mediumText}>Scan QR</Text>
                            <IconF name='user-plus' size={20} style={{color: '#555', marginTop: 6}}/>
                        </TouchableOpacity>
                    </View>
                }
                <ScrollView style={{backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#888', marginBottom: 120}}>
                    {   // covid patient has been selected
                        (isCOVIDTest) &&
                        <>
                            <View style={styles.infoSection}>
                                {
                                    (patientDataCOVID.email) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Email</Text>
                                        <Text style={styles.text}>{patientDataCOVID.email}</Text>
                                    </View>
                                }
                                {
                                    (patientDataCOVID.phone) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Phone</Text>
                                        <Text style={styles.text}>{patientDataCOVID.phone}</Text>
                                    </View>
                                }
                            </View>
                            <View style={{padding: 20}}>
                                <Text style={styles.headingText}>Test Results</Text>
                                {
                                    (patientCOVIDTests.length === 0) &&
                                    <Text style={{color: '#555', paddingTop: 6, fontSize: 18, textAlign: 'center'}}>
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
                        (isFibrinogenTest) &&
                        <>
                            <View style={styles.infoSection}>
                                {
                                    (patientDataFibrinogen.bloodType) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Blood Type</Text>
                                        <Text style={styles.text}>{patientDataFibrinogen.bloodType}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.sex) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Sex</Text>
                                        <Text style={styles.text}>{patientDataFibrinogen.sex}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.age) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Age</Text>
                                        <Text style={styles.text}>{patientDataFibrinogen.age}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.weight) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Weight</Text>
                                        <Text style={styles.text}>{patientDataFibrinogen.weight}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.height) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Height</Text>
                                        <Text style={styles.text}>{patientDataFibrinogen.height}</Text>
                                    </View>

                                }
                            </View>
                            <View style={[styles.section, {marginVertical: 20, paddingVertical: 10}]}>
                                {
                                    (patientFibrinogenTests.length === 0) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Saved results</Text>
                                        <Text style={styles.text}>0 results</Text>
                                    </View>
                                }
                                {
                                    (patientFibrinogenTests.length > 0) &&
                                    <View style={styles.field}>
                                        <Text style={styles.sectionText}>Saved results</Text>
                                        <Text style={styles.text}>{patientFibrinogenTests.length} results</Text>
                                    </View>
                                }
                                {
                                    (patientFibrinogenTests.length !== 0 && chartData) &&
                                    <View style={{flex: 0.6, padding: 15}}>
                                        <LineChart
                                            data={chartData}
                                            width={screenWidth*0.75}
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
                            </View>
                        </>
                    }
                    {
                        (!isCOVIDTest && !isFibrinogenTest) &&
                        <Text style={[fonts.heading, {padding: 25, paddingTop: 90}]}>
                            To view a patient portal, select the test type and the patient or scan their QR code
                        </Text>
                    }
                </ScrollView>
            </View>
            <UserBar navigation={navigation}/>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    infoSection: {
        borderRadiusTopRight: 10,
        borderRadiusTopLeft: 10,
        backgroundColor: '#eee',
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
    },
    section: {
        backgroundColor: '#fff',
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        margin: 10,
    },
    page: {
        backgroundColor: '#222',
        flex: 1,
        justifyContent: 'space-around'
    },
    field: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between'
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
        color: darkText,
        textAlign: 'left',
        fontWeight: 'bold',
        flex: 1
    },
    sectionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: darkText,
        textAlign: 'center',
        paddingTop: 4,
        paddingBottom: 4,
    },
    text: {
        fontSize: 18,
        color: darkText,
        textAlign: 'center',
        paddingTop: 4,
        paddingBottom: 4,
    },
    headingContainer: {
        backgroundColor: '#ccc',
        textAlign: darkText,
    },
    headingText: {
        fontSize: 24,
        color: darkText,
        fontWeight: 'bold',
        textAlign: 'left',
    },
});

export default ViewData;