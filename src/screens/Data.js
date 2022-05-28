import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import ModalSelector from 'react-native-modal-selector';
import IconA from 'react-native-vector-icons/AntDesign';
import IconE from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/Feather';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    backgroundColor,
    chart,
    chartConfig,
    chartContainer,
    device, fabColor,
    fonts,
    format,
    modal,
    patientSelect,
    rbCameraSheetStyle,
    testSelect
} from '../style/Styles';
import database from '@react-native-firebase/database';
import {parseISO} from 'date-fns';
import {LineChart} from 'react-native-chart-kit';
import useAuth from "../auth/UserContext";
import {useIsFocused} from '@react-navigation/native';
import useWindowDimensions from "react-native/Libraries/Utilities/useWindowDimensions";
import QRScanSheet from "../sheets/QRScanSheet";
import IconFA from "react-native-vector-icons/FontAwesome5";
import IconO from "react-native-vector-icons/Octicons";
import IconMI from "react-native-vector-icons/MaterialCommunityIcons";
import {FloatingAction} from "react-native-floating-action";

const Data = ({navigation}) => {
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
        patientsRef = database().ref(patientsPath),
        scanSheetRef = useRef(null);

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
            if (patientResults) {
                const tempTests = Array.from(Object.values(patientResults));
                setPatientCOVIDTests(tempTests.reverse());
            } else {
                setPatientCOVIDTests([]);
            }
        } else if (selectedTest === 'fibrinogen') {
            setPatientDataFibrinogen(patients['fibrinogen-patients'][patientKey]);
            setPatientKeyFibrinogen(patientKey);
            const patientResults = patients['fibrinogen-patients'][patientKey]['results'];
            if (patientResults) {
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

    const fabProps = {
        buttonSize: 60,
        color:'#8d67a8',
        position: 3
    }

    const fabActions = [
        {
            ...fabProps,
            text: "My Account",
            icon: <IconFA name='user-md' color={backgroundColor} size={30}/>,
            name: "account",
        },
        {
            ...fabProps,
            text: "My Organization",
            icon: <IconO name='organization' color={backgroundColor} size={30}/>,
            name: "organization",
            buttonSize: 60,
            color:'#8d67a8',
            position: 2
        },
        {
            ...fabProps,
            text: "Create new COVID patient",
            icon: <IconFA name='user-plus' color={backgroundColor} size={30}/>,
            name: "create_covid",
        },
        {
            ...fabProps,
            text: "Create new fibrinogen patient",
            icon: <IconFA name='user-plus' color={backgroundColor} size={30}/>,
            name: "create_fibrinogen",
        },
        {
            ...fabProps,
            text: "Scan patient QR",
            icon: <IconMCI name='qrcode-scan' color={backgroundColor} size={30}/>,
            name: "qr",
        },
    ];

    const fabActionHandler = (actionName) => {
        console.log(actionName)
    }

    return (
        <SafeAreaView style={[format.safeArea]}>
            <ModalSelector
                onModalClose={(option) => {
                    if (option[0])
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
                    if (option[0])
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
            <View style={testSelect.container}>
                <TouchableOpacity onPress={() => setSelectedTest('covid')}
                                  style={[testSelect.testSelectButton,
                                      selectedTest === 'covid'
                                          ? testSelect.covidSelected
                                          : {}]}>
                    <Text style={testSelect.selectButtonText}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTest('fibrinogen')}
                                  style={[testSelect.testSelectButton,
                                      selectedTest === 'fibrinogen'
                                          ? testSelect.fibrinogenSelected
                                          : {}]}>
                    <Text style={testSelect.selectButtonText}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
            <View style={patientSelect.container}>
                <TouchableOpacity style={patientSelect.barButton}
                                  onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                    <Text style={patientSelect.iconText}>Create</Text>
                    <IconF name='user-plus' size={18} style={patientSelect.icon}/>
                </TouchableOpacity>
                <TouchableOpacity style={patientSelect.barButton} onPress={() => {
                    if (selectedTest === 'covid') {
                        setCOVIDPatientModalVisible(true);
                    } else if (selectedTest === 'fibrinogen') {
                        setFibrinogenPatientModalVisible(true);
                    }
                }}>
                    <Text style={patientSelect.iconText}>Select</Text>
                    <IconE name='list' size={18} style={patientSelect.icon}/>
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
                                    <Text style={patientSelect.iconText}>Edit</Text>
                                    <IconA name='edit' size={20}
                                           style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
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
                                                          {patientKey: patientKeyFibrinogen})
                                                  }}>
                                    <Text style={patientSelect.iconText}>Edit</Text>
                                    <IconA name='edit' size={20}
                                           style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
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
                                        <Text style={[fonts.sectionText, {alignSelf: 'center', paddingLeft: 15}]}>Patient
                                            Results</Text>
                                        <TouchableOpacity style={format.utilityBarButton}
                                                          onPress={() => navigation.navigate('Create Patient Fibrinogen')}>
                                            <Text style={patientSelect.iconText}>Export</Text>
                                            <IconF name='share' size={20}
                                                   style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
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
                                            patientFibrinogenTests.map(test => <FibrinogenTest key={test.time}
                                                                                               item={test}/>)
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
            </View>
            <FloatingAction
                actions={fabActions}
                distanceToEdge={{ vertical: 120, horizontal: 20 }}
                iconWidth={20}
                iconHeight={20}
                buttonSize={68}
                overlayColor={'rgb(141, 103, 168, 1.0)'}
                color={fabColor}
                floatingIcon={<IconMI name='menu' color={backgroundColor} size={30}/>}
                style={{marginBottom: 60}}
                onPressItem={name => fabActionHandler(name)}
            />
            <QRScanSheet scanSheetRef={scanSheetRef} />
        </SafeAreaView>
    );
};

export default Data;