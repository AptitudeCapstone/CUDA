import React, {useRef, useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import ModalSelector from 'react-native-modal-selector';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    buttons,
    fonts,
    format,
    modal,
    chart,
    chartContainer,
    chartConfig,
    rbCameraSheetStyle,
    device,
    patientSelectBar
} from '../style';
import database from '@react-native-firebase/database';
import {format as dateFormat, parseISO} from 'date-fns';
import {LineChart} from 'react-native-chart-kit';
import UserBar from "../components/UserBar";
import useAuth from "../contexts/UserContext";
import {useIsFocused} from '@react-navigation/native';
import QRCodeScanner from "react-native-qrcode-scanner";
import {RNCamera} from "react-native-camera";
import RBSheet from "react-native-raw-bottom-sheet";
import useWindowDimensions from "react-native/Libraries/Utilities/useWindowDimensions";

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
        [covidPatientModalVisible, setCOVIDPatientModalVisible] = useState(() => false),
        [fibrinogenPatientModalVisible, setFibrinogenPatientModalVisible] = useState(() => false),
        modalRef = useRef(),
        dimensions = useWindowDimensions(),
        [chartData, setChartData] = useState({labels: ['0'], datasets: [{data: [0]}]}),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        loginStatus = userInfo.loginStatus,
        organization = userInfo.user?.organization,
        patientsPath = (organization ? '/organizations/' + organization + '/patients/' : '/users/' + auth?.uid),
        patientsRef = database().ref(patientsPath);

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
            const patientResults = patients['covid-patients'][patientKey]['results'];
            if(patientResults) {
                const tempTests = Array.from(Object.values(patientResults));
                setPatientCOVIDTests(tempTests.reverse());
            } else {
                setPatientCOVIDTests([]);
            }
        } else if (selectedTest === 'fibrinogen') {
            setPatientDataFibrinogen(patients['fibrinogen-patients'][patientKey]);
            setPatientKeyFibrinogen(patientKey);
            const patientResults = patients['fibrinogen-patients'][patientKey]['results'];
            if(patientResults) {
                const tempTests = Array.from(Object.values(patientResults));
                setPatientFibrinogenTests(tempTests.reverse());

                let tempLabels = [], tempDatasets = [];
                for (const fibTest of tempTests) {
                    //tempLabels.push(dateFormat(parseISO(fibTest.time), 'MMM d'));
                    const hoursAgo = Math.abs(new Date() - parseISO(fibTest.time)) / 36e5;
                    tempLabels.push(hoursAgo.toFixed(2));
                    tempDatasets.push(fibTest.result);
                }

                setChartData({
                    labels: tempLabels,
                    datasets: [{
                        data: tempDatasets
                    }]
                })
            } else {
                setPatientFibrinogenTests([]);
                setChartData([]);
            }
        }
    }

    const COVIDTest = ({item}) => (
        <View style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}>
            <View style={{
                backgroundColor: '#353535', padding: 20, paddingBottom: 10,
                flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15
            }}>
                <Text style={fonts.mediumText}>
                    {parseISO(item.time).toLocaleString()}
                </Text>
            </View>
            <Text style={[fonts.mediumText, {padding: 20}]}>
                {(item.result !== undefined && item.result === 0) ? 'Negative' : 'Positive'}
            </Text>
        </View>
    );

    const FibrinogenTest = ({item}) => (
        <View style={{flexDirection: 'row', backgroundColor: '#eee', borderRadius: 15, flex: 1, marginVertical: 10}}>
            <View style={{
                backgroundColor: '#ddd', padding: 20, paddingBottom: 10,
                flex: 1, borderTopLeftRadius: 15, borderBottomLeftRadius: 15
            }}>
                <Text style={fonts.mediumText}>
                    {parseISO(item.time).toLocaleString()}
                </Text>
            </View>
            <Text style={[fonts.mediumText, {padding: 20}]}>{item.result} mg/ml</Text>
        </View>
    );

    const isCOVIDTest = (patientKeyCOVID && patientDataCOVID && selectedTest === 'covid');
    const isFibrinogenTest = (patientKeyFibrinogen && patientDataFibrinogen && selectedTest === 'fibrinogen');


    return (
        <SafeAreaView style={[format.safeArea]}>
            <ModalSelector
                onModalClose={(option) => {
                    if(option[0])
                        selectedPatientChanged(option[0]);
                    setFibrinogenPatientModalVisible(false);
                }}
                renderItem={<View/>}
                customSelector={<View/>}
                visible={fibrinogenPatientModalVisible}
                data={fibrinogenPatients}
                keyExtractor={patient => patient[0]}
                labelExtractor={patient => patient[1]['name']}
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
            <ModalSelector
                onModalClose={(option) => {
                    if(option[0])
                        selectedPatientChanged(option[0]);
                    setCOVIDPatientModalVisible(false);
                }}
                renderItem={<View/>}
                customSelector={<View/>}
                visible={covidPatientModalVisible}
                data={covidPatients}
                keyExtractor={patient => patient[0]}
                labelExtractor={patient => patient[1]['name']}
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
            <View style={patientSelectBar.container}>
                <TouchableOpacity style={patientSelectBar.barButton} onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                    <Text style={patientSelectBar.iconText}>Create</Text>
                    <IconF name='user-plus' size={18} style={patientSelectBar.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={patientSelectBar.barButton} onPress={() => modalRef.current?.open()}>
                    <Text style={patientSelectBar.iconText}>Scan</Text>
                    <IconMCI name='qrcode-scan' size={18} style={patientSelectBar.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={patientSelectBar.barButton} onPress={() => {
                    if(selectedTest === 'covid') {
                        setCOVIDPatientModalVisible(true);
                    } else if(selectedTest === 'fibrinogen') {
                        setFibrinogenPatientModalVisible(true);
                    }
                }}>
                    <Text style={patientSelectBar.iconText}>Select</Text>
                    <IconE name='list' size={18} style={patientSelectBar.icon} />
                </TouchableOpacity>
            </View>
            <View style={[format.page]}>
                <ScrollView>
                    {
                        (isCOVIDTest) &&
                        <>
                            <View style={format.utilityPatientBarContainer}>
                                <Text style={fonts.sectionText}>{patientDataCOVID.name}</Text>
                                <TouchableOpacity style={format.utilityBarButton}
                                                  onPress={() => navigation.navigate('Edit Patient COVID',
                                                      {patientKey: patientKeyCOVID})}>
                                    <Text style={patientSelectBar.iconText}>Edit</Text>
                                    <IconA name='edit' size={20} style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
                                </TouchableOpacity>
                            </View>
                            <View style={format.section}>
                                {
                                    (patientDataCOVID.email) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Email</Text>
                                        <Text style={fonts.mediumText}>{patientDataCOVID.email}</Text>
                                    </View>
                                }
                                {
                                    (patientDataCOVID.phone) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Phone</Text>
                                        <Text style={fonts.mediumText}>{patientDataCOVID.phone}</Text>
                                    </View>
                                }
                            </View>
                            <View style={format.utilityPatientBarContainer}>
                                <Text style={[fonts.sectionText, {alignSelf: 'center', paddingLeft: 15}]}>Patient Results</Text>
                                <TouchableOpacity style={format.utilityBarButton}
                                                  onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                                    <Text style={patientSelectBar.iconText}>Export</Text>
                                    <IconF name='share' size={20} style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
                                </TouchableOpacity>
                            </View>
                            {
                                (patientCOVIDTests.length > 0) &&
                                <View style={{paddingVertical: 10}}>
                                            {patientCOVIDTests.map(test => <COVIDTest key={test.key} item={test}/>)}
                                </View>
                            }
                            {
                                (patientCOVIDTests.length === 0) &&
                                <View style={{paddingVertical: 10}}>
                                    <Text style={[fonts.fieldName, {color: '#999', paddingHorizontal: 20}]}>
                                        No results have been saved for this patient yet
                                    </Text>
                                </View>
                            }
                        </>
                    }
                    {
                        (isFibrinogenTest) &&
                        <>
                            <View style={format.utilityPatientBarContainer}>
                                <Text style={[fonts.sectionText, {alignSelf: 'center', paddingLeft: 15}]}>
                                    {patientDataFibrinogen.name}
                                </Text>
                                <TouchableOpacity style={format.utilityBarButton}
                                                  onPress={() => {
                                                      navigation.navigate('Edit Patient Fibrinogen',
                                                          {patientKey: patientKeyFibrinogen})}}>
                                    <Text style={patientSelectBar.iconText}>Edit</Text>
                                    <IconA name='edit' size={20} style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
                                </TouchableOpacity>
                            </View>
                            <View style={format.section}>
                                {
                                    (patientDataFibrinogen.bloodType) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Blood Type</Text>
                                        <Text style={fonts.mediumText}>{patientDataFibrinogen.bloodType}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.sex) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Sex</Text>
                                        <Text style={fonts.mediumText}>{patientDataFibrinogen.sex}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.age) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Age</Text>
                                        <Text style={fonts.mediumText}>{patientDataFibrinogen.age}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.weight) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Weight</Text>
                                        <Text style={fonts.mediumText}>{patientDataFibrinogen.weight}</Text>
                                    </View>
                                }
                                {
                                    (patientDataFibrinogen.height) &&
                                    <View style={format.field}>
                                        <Text style={fonts.fieldName}>Height</Text>
                                        <Text style={fonts.mediumText}>{patientDataFibrinogen.height}</Text>
                                    </View>
                                }
                            </View>
                            {
                                (patientFibrinogenTests.length > 0) &&
                                <>
                                    <View style={format.utilityPatientBarContainer}>
                                        <Text style={[fonts.sectionText, {alignSelf: 'center', paddingLeft: 15}]}>Patient Results</Text>
                                        <TouchableOpacity style={format.utilityBarButton}
                                                          onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                                            <Text style={patientSelectBar.iconText}>Export</Text>
                                            <IconF name='share' size={20} style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={format.section}>
                                        <View style={[chartContainer]}>
                                            <Text style={fonts.fieldName}>Last 24 hours</Text>
                                            <LineChart
                                                data={(chartData.labels.length === 0) ? [] : chartData}
                                                width={dimensions.width} // from react-native
                                                height={250}
                                                chartConfig={chartConfig}
                                                style={chart}
                                                withInnerLines={false}
                                                withOuterLines={false}
                                                formatYLabel={(yLabel) => parseInt(yLabel)}
                                                yLabelsOffset={30} //10
                                            />
                                        </View>
                                        {
                                            patientFibrinogenTests.map(test => <FibrinogenTest key={test.time} item={test} />)
                                        }
                                    </View>
                                </>
                            }
                            {
                                (patientFibrinogenTests.length === 0) &&
                                <View style={{paddingVertical: 10}}>
                                    <Text style={[fonts.fieldName, {color: '#999', paddingHorizontal: 20}]}>
                                        No results have been saved for this patient yet
                                    </Text>
                                </View>
                            }
                        </>
                    }
                    {
                        (!isCOVIDTest && !isFibrinogenTest) &&
                        <>
                            <View style={[format.utilityPatientBarContainer, {justifyContent: 'center'}]}>
                                <Text style={[fonts.sectionText, {alignSelf: 'center'}]}>No patient selected</Text>
                            </View>
                            <View style={format.section}>
                                <Text style={[fonts.mediumText, {padding: 25}]}>
                                    To select a patient, scan their QR code or use the 'Select' button above
                                </Text>
                            </View>
                        </>
                    }
                </ScrollView>
                <UserBar navigation={navigation}/>
            </View>
            <View style={format.testSelectBar}>
                <TouchableOpacity onPress={() => setSelectedTest('covid')}
                                  style={selectedTest === 'covid' ? buttons.covidSelectButton : buttons.unselectedButton}>
                    <Text style={fonts.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTest('fibrinogen')}
                                  style={selectedTest === 'fibrinogen' ? buttons.fibrinogenSelectButton : buttons.unselectedButton}>
                    <Text style={fonts.selectButtonText}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
            <RBSheet
                ref={modalRef} height={dimensions.height * 0.75} customStyles={rbCameraSheetStyle}>
                <QRCodeScanner
                    onRead={(e) => {
                        Alert.alert('Scanned data: ', e.data);
                        modalRef.current?.close();
                    }}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    topContent={
                        <Text style={[device.statusText, {color: '#888', textAlign: 'center'}]}>
                            Place QR code into the frame
                        </Text>
                    }
                />
            </RBSheet>
        </SafeAreaView>
    );
};

export default ViewData;