import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import { format as dateFormat } from "date-fns";
import ModalSelector from 'react-native-modal-selector';
import IconA from 'react-native-vector-icons/AntDesign';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    backgroundColor,
    chart,
    chartConfig,
    chartContainer,
    MainFabIcon,
    fabColor,
    fonts,
    format,
    modal,
    patientSelect,
    testSelect, darkText
} from '../style/Styles';
import database from '@react-native-firebase/database';
import {parseISO} from 'date-fns';
import useAuth from "../auth/UserContext";
import {useIsFocused} from '@react-navigation/native';
import useWindowDimensions from "react-native/Libraries/Utilities/useWindowDimensions";
import QRScanSheet from "../sheets/QRScanSheet";
import IconFA from "react-native-vector-icons/FontAwesome5";
import {FloatingAction} from "react-native-floating-action";
import {Account} from "../sheets/user/Account";
import {Organization} from "../sheets/user/Organization";
import {CreateCOVID} from "../sheets/data/CreateCOVID";
import {EditCOVID} from "../sheets/data/EditCOVID";
import {CreateFibrinogen} from "../sheets/data/CreateFibrinogen";
import {EditFibrinogen} from "../sheets/data/EditFibrinogen";
import SignInSignUp from "../sheets/user/SignInSignUp";
import EditAccount from "../sheets/user/EditAccount";
import {LineChart} from 'react-native-chart-kit';

const Data = () => {
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
        dimensions = useWindowDimensions(),
        emptyChartData = {
            labels: ['0'],
            datasets: [
                {
                    data: [0]
                }
            ]
        },
        [chartData, setChartData] = useState(() => emptyChartData),
        [chartTimeAxis, setChartTimeAxis] = useState('today'),
        userInfo = useAuth(),
        auth = userInfo.userAuth,
        loginStatus = userInfo.loginStatus,
        organization = userInfo.user?.organization,
        patientsPath = (organization
            ? '/organizations/' + organization + '/patients/'
            : '/users/' + auth?.uid + '/patients/'),
        patientsRef = database().ref(patientsPath),
        accountSlideUpRef = useRef(null),
        editAccountSlideUpRef = useRef(null),
        organizationSlideUpRef = useRef(null),
        scanSheetRef = useRef(null),
        createCOVIDSlideUpRef = useRef(null),
        editCOVIDSlideUpRef = useRef(null),
        createFibrinogenSlideUpRef = useRef(null),
        editFibrinogenSlideUpRef = useRef(null),
        signInSignUpSlideUpRef = useRef(null);

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
            let patientResults = patients['fibrinogen-patients'][patientKey]['results'];
            if (patientResults) {
                patientResults = Object.values(patientResults);
                console.log('not sorted:', JSON.stringify(patientResults, null, 4));
                const sorted = patientResults.sort((a,b) => parseISO(a.time) - parseISO(b.time));
                console.log('sorted:', JSON.stringify(sorted, null, 4));
                const tempTests = Array.from(sorted);
                console.log(tempTests);
                let tempChartData = [];
                let tempLabels = [];

                tempTests.forEach((item) => {
                    /*
                    const now = new Date().getTime();
                    const testTime = parseISO(item.time).getTime();
                    const secondsAgo = Math.abs(now - testTime) / 10e3;

                    if(chartTimeAxis === 'last hour') {
                        tempLabels.push((secondsAgo).toFixed(1));
                    } else if(chartTimeAxis === 'today') {
                        tempLabels.push((secondsAgo / 60 / 60).toFixed(1));
                    } else if(chartTimeAxis === 'this week') {
                        tempLabels.push((secondsAgo / 60 / 60 / 24).toFixed(1));
                    }
                    */



                    tempLabels.push(dateFormat(parseISO(item.time), 'H:mm'));
                    tempChartData.push(parseFloat(item.result));
                });

                tempLabels.sort(function(a, b){
                    return tempChartData.indexOf(a) - tempChartData.indexOf(b);
                });

                console.log(tempLabels);
                console.log(tempChartData);

                setPatientFibrinogenTests(tempTests.reverse());
                setChartData({
                    labels: tempLabels,//tempLabels,
                    datasets: [{
                            data: tempChartData
                        }]
                });
            } else {
                setPatientFibrinogenTests([]);
            }
        }
    }

    const COVIDTest = ({item}) => (
        <View style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}>
            <View style={{backgroundColor: '#353535', padding: 20, paddingBottom: 10,
                flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
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
        <View style={{backgroundColor: '#eee', borderRadius: 15, flex: 1, marginVertical: 10}}>
            <View style={{backgroundColor: '#ddd', padding: 20, paddingBottom: 10, flex: 1, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                <Text style={fonts.mediumText}>
                    {parseISO(item.time).toLocaleString()}
                </Text>
            </View>
            <Text style={[fonts.mediumText, {padding: 20}]}>{item.result} mg/ml</Text>
        </View>
    );


    const fabPropsCommon = {
        buttonSize: 60,
        color:'#8d67a8',
        position: 3,
        textStyle: {fontSize: 16}
    };

    const fabActionsDefault = [
        {
            ...fabPropsCommon,
            text: "Create new patient",
            icon: <IconFA name='user-plus' color={backgroundColor} size={30}/>,
            name: "create_patient",
        },
        {
            ...fabPropsCommon,
            text: "Scan patient QR",
            icon: <IconMCI name='qrcode-scan' color={backgroundColor} size={30}/>,
            name: "qr",
        },
    ];

    const [fabActions, setFabActions] = useState(fabActionsDefault);

    useEffect(() => {
        let organizationButtons = [];

        if(userInfo.loginStatus === 'registered') {
            organizationButtons = [{
                ...fabPropsCommon,
                text: "My organization",
                name: "organization",
                icon: <IconFA name='user-md' color={backgroundColor} size={30}/>,
            }];
        }

        switch(userInfo.loginStatus) {
            case 'registered':
                const registeredButtons = [{
                    ...fabPropsCommon,
                    text: "My account",
                    name: "account",
                    icon: <IconFA name='user-md' color={backgroundColor} size={30}/>,
                }]
                setFabActions(registeredButtons.concat(organizationButtons).concat(fabActionsDefault));
                break;
            case 'Patient not selected':
                // sign in button
                const signInSignUpButton = [{
                    ...fabPropsCommon,
                    text: "Sign in or create an account",
                    name: "sign_in_sign_up",
                    icon: <IconFA name='user-md' color={backgroundColor} size={30}/>,
                }]
                setFabActions(signInSignUpButton.concat(organizationButtons).concat(fabActionsDefault));
                break;
            default:
                setFabActions(organizationButtons.concat(fabActionsDefault));
        }
    }, [isFocused, userInfo]);

    const fabActionHandler = (actionName) => {
        switch(actionName) {
            case 'account':
                accountSlideUpRef.current?.open();
                break;
            case 'organization':
                organizationSlideUpRef.current?.open();
                break;
            case 'create_patient':
                Alert.alert(
                    'Create a new patient',
                    'Select the category of patient',
                    [
                        {
                            text: 'COVID',
                            onPress: () => createCOVIDSlideUpRef.current?.open()
                        },
                        {
                            text: 'Fibrinogen',
                            onPress: () => createFibrinogenSlideUpRef.current?.open()
                        },
                        {
                            text: 'Cancel',
                            onPress: () => null,
                            style: 'cancel'
                        }
                    ]
                );
                break;
            case 'sign_in_sign_up':
                signInSignUpSlideUpRef.current?.open();
                break;
            case 'qr':
                scanSheetRef.current?.open();
                break;
        }
    }

    const isCOVIDTest = (patientKeyCOVID && patientDataCOVID && selectedTest === 'covid');
    const isFibrinogenTest = (patientKeyFibrinogen && patientDataFibrinogen && selectedTest === 'fibrinogen');

    return (
        <SafeAreaView style={[format.safeArea]}>
            <View style={[{backgroundColor: '#fff'} ,
                {marginHorizontal: 20, borderRadius: 20, borderColor: '#ccc', borderWidth: 1}]}>
                <View style={testSelect.container}>
                    <TouchableOpacity onPress={() => setSelectedTest('covid')}
                                      style={[testSelect.button, selectedTest === 'covid' ? {backgroundColor: '#9fa3c5'} : {backgroundColor: '#eeeeee'}]}>
                        <Text style={[testSelect.text, selectedTest === 'covid' ? {} : {color: '#aaa'}]}>COVID</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTest('fibrinogen')}
                                      style={[testSelect.button, selectedTest === 'fibrinogen' ? {backgroundColor: '#c57f7f'} : {backgroundColor: '#eeeeee'}]}>
                        <Text style={[testSelect.text, selectedTest === 'fibrinogen' ? {} : {color: '#aaa'}]}>Fibrinogen</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={[patientSelect.container, selectedTest === 'covid' ? {backgroundColor: '#9fa3c5'} : {backgroundColor: '#c57f7f'}]} onPress={() => {
                    if (selectedTest === 'covid') {
                        setCOVIDPatientModalVisible(true);
                    } else if (selectedTest === 'fibrinogen') {
                        setFibrinogenPatientModalVisible(true);
                    }}}>
                    <Text style={patientSelect.text}>Select</Text>
                    <IconFA name='user' size={24} style={patientSelect.icon}/>
                </TouchableOpacity>
            </View>
            <View style={[format.page]}>
                <ScrollView style={{marginHorizontal: 25, padding: 15, paddingTop: 0, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', borderRadius: 20, marginTop: 20, marginBottom: 175, }}>
                    {
                        (isCOVIDTest)
                            ? <>
                                <View style={format.utilityPatientBarContainer}>
                                    <Text style={[fonts.sectionText, {paddingLeft: 8}]}>{patientDataCOVID.name}</Text>
                                    <TouchableOpacity style={format.utilityBarButton}
                                                      onPress={() => editCOVIDSlideUpRef.current?.open()}>
                                        <Text style={fonts.mediumText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={format.section}>
                                    {
                                        (patientDataCOVID.email)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Email</Text>
                                                <Text style={fonts.mediumText}>{patientDataCOVID.email}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataCOVID.phone)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Phone</Text>
                                                <Text style={fonts.mediumText}>{patientDataCOVID.phone}</Text>
                                            </View>
                                            : null
                                    }
                                </View>
                                {
                                    (patientCOVIDTests.length > 0)
                                        ? <View style={{paddingVertical: 10}}>
                                            {patientCOVIDTests.map(test => <COVIDTest key={test.key} item={test}/>)}
                                        </View>
                                        : null
                                }
                                {
                                    (patientCOVIDTests.length === 0) &&
                                    <View style={{paddingVertical: 10}}>
                                        <Text style={[fonts.fieldName, {color: '#999', paddingHorizontal: 20}]}>
                                            This patient has no results to show
                                        </Text>
                                    </View>
                                }
                            </>
                            : null

                    }
                    {
                        (isFibrinogenTest)
                            ? <>
                                <View style={format.utilityPatientBarContainer}>
                                    <Text style={[fonts.sectionText, {paddingLeft: 8}]}>
                                        {patientDataFibrinogen.name}
                                    </Text>
                                    <TouchableOpacity style={format.utilityBarButton}
                                                      onPress={() => editFibrinogenSlideUpRef.current?.open()}>
                                        <Text style={fonts.mediumText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    {
                                        (patientDataFibrinogen.bloodType)
                                            ? <View style={[format.field, {paddingVertical: 3}]}>
                                                <Text style={fonts.mediumText}>Blood Type</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.bloodType}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.sex)
                                            ? <View style={format.field}>
                                                <Text style={fonts.mediumText}>Sex</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.sex}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.age)
                                            ? <View style={format.field}>
                                                <Text style={fonts.mediumText}>Age</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.age}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.weight)
                                            ? <View style={format.field}>
                                                <Text style={fonts.mediumText}>Weight</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.weight}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.height)
                                            ? <View style={format.field}>
                                                <Text style={fonts.mediumText}>Height</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.height}</Text>
                                            </View>
                                            : null
                                    }
                                </View>
                                {
                                    (patientFibrinogenTests.length > 0)
                                        ? <>
                                            <View>
                                                <View style={[chartContainer]}>
                                                    <Text style={[fonts.fieldName, {alignSelf: 'center', marginTop: 20, marginBottom: 10}]}>Recent results (mg/dL)</Text>
                                                    <LineChart
                                                        verticalLabelRotation={-70}
                                                        xLabelsOffset={22}
                                                        data={chartData}
                                                        width={280}
                                                        height={300}
                                                        withInnerLines={false}
                                                        withShadow={false}
                                                        yAxisInterval={1}
                                                        chartConfig={{
                                                            backgroundColor: "#eaeaea",
                                                            backgroundGradientFrom: "#ffffff",
                                                            backgroundGradientTo: "#ffffff",
                                                            propsForLabels: {
                                                                fontSize: "14",
                                                            },
                                                            decimalPlaces: 2, // optional, defaults to 2dp
                                                            color: (opacity = 1) => `rgba(39, 74, 130, ${opacity})`,
                                                            labelColor: (opacity = 1) => `rgba(39, 74, 130, ${opacity})`,
                                                            style: {
                                                                borderRadius: 16
                                                            },
                                                            propsForDots: {
                                                                r: "6",
                                                                strokeWidth: "2",
                                                                stroke: "#274a82"
                                                            }
                                                        }}
                                                        style={{
                                                            marginTop: 8,
                                                            marginBottom: -45,
                                                            borderRadius: 16,
                                                            alignSelf: 'center'
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                            <Text style={[fonts.fieldName, {paddingLeft: 12, alignSelf: 'flex-start', marginTop: 70, marginBottom: 10}]}>All results</Text>
                                            <View>
                                                {
                                                    patientFibrinogenTests.map(test => <FibrinogenTest key={test.time}
                                                                                                       item={test}/>)
                                                }
                                            </View>
                                        </>
                                        : null
                                }
                                {
                                    (patientFibrinogenTests.length === 0)
                                        ? <View style={{paddingVertical: 10}}>
                                            <Text style={[fonts.fieldName, {color: '#999', paddingHorizontal: 20}]}>
                                                This patient has no results to show
                                            </Text>
                                        </View>
                                        : null
                                }
                            </>
                            : null
                    }
                    {
                        (!isCOVIDTest && !isFibrinogenTest)
                            ? <View style={{marginTop: 20}}>
                                <Text style={[fonts.sectionText, {alignSelf: 'center'}]}>No patient selected</Text>
                                <Text style={[fonts.mediumText, {padding: 25}]}>
                                    To select a patient, scan their QR code or use the 'Select' button above
                                </Text>
                            </View>
                            : null
                    }
                </ScrollView>
            </View>

            <FloatingAction
                actions={fabActions}
                distanceToEdge={{ vertical: 120, horizontal: 20 }}
                iconWidth={20}
                iconHeight={20}
                buttonSize={68}
                overlayColor='rgba(0, 0, 0, 0.3)'
                color={fabColor}
                floatingIcon={<MainFabIcon />}
                onPressItem={(name) => fabActionHandler(name)} />

            <ModalSelector
                visible={covidPatientModalVisible}
                data={covidPatients}
                onModalClose={(option) => {
                    if (option[0])
                        selectedPatientChanged(option[0]);
                    setCOVIDPatientModalVisible(false);
                }}
                keyExtractor={patient => patient[0]}
                labelExtractor={patient => patient[1]['name']}
                renderItem={<View/>}
                customSelector={<View/>}
                cancelText={'Cancel'}
                searchText={'Search patient by name'}
                overlayStyle={modal.overlay}
                optionContainerStyle={modal.container}
                optionTextStyle={modal.optionText}
                optionStyle={modal.option}
                cancelStyle={modal.cancelOption}
                cancelTextStyle={modal.cancelText}
                searchStyle={modal.searchBar} />

            <ModalSelector
                visible={fibrinogenPatientModalVisible}
                data={fibrinogenPatients}
                onModalClose={(option) => {
                    if (option[0])
                        selectedPatientChanged(option[0]);
                    setFibrinogenPatientModalVisible(false);
                }}
                keyExtractor={patient => patient[0]}
                labelExtractor={patient => patient[1]['name'] ? patient[1]['name'] : patient[0].toString()}
                renderItem={<View/>}
                customSelector={<View/>}
                cancelText={'Cancel'}
                searchText={'Search patient by name'}
                overlayStyle={modal.overlay}
                optionContainerStyle={modal.container}
                optionTextStyle={modal.optionText}
                optionStyle={modal.option}
                cancelStyle={modal.cancelOption}
                cancelTextStyle={modal.cancelText}
                searchStyle={modal.searchBar} />

            <SignInSignUp modalRef={signInSignUpSlideUpRef} />
            <Account modalRef={accountSlideUpRef}
                     editModalRef={editAccountSlideUpRef} />
            <EditAccount modalRef={editAccountSlideUpRef}
                         accountRef={accountSlideUpRef} />
            <Organization modalRef={organizationSlideUpRef} />

            <CreateCOVID modalRef={createCOVIDSlideUpRef} />
            <CreateFibrinogen modalRef={createFibrinogenSlideUpRef} />
            <EditCOVID modalRef={editCOVIDSlideUpRef}
                       patientKey={patientKeyCOVID} />
            <EditFibrinogen modalRef={editFibrinogenSlideUpRef}
                            patientKey={patientKeyFibrinogen} />

            <QRScanSheet scanSheetRef={scanSheetRef} />
        </SafeAreaView>
    );
};

export default Data;