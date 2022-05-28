import React, {useEffect, useRef, useState} from 'react';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
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
import {FloatingAction} from "react-native-floating-action";
import {Account} from "../sheets/user/Account";
import {Organization} from "../sheets/user/Organization";
import {CreateCOVID} from "../sheets/data/CreateCOVID";
import {EditCOVID} from "../sheets/data/EditCOVID";
import {CreateFibrinogen} from "../sheets/data/CreateFibrinogen";
import {EditFibrinogen} from "../sheets/data/EditFibrinogen";
import SignInSignUp from "../sheets/user/SignInSignUp";
import EditAccount from "../sheets/user/EditAccount";
import QRCodes from "../QRCodes";

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
        [chartData, setChartData] = useState({labels: ['0'], datasets: [{data: [0]}]}),
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
        qrScanSlideUpRef = useRef(null),
        qrGenerateSlideUpRef = useRef(null),
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
            name: "qr_scan",
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
            case 'guest':
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
            case 'qr_scan':
                qrScanSlideUpRef.current?.open();
                break;
            case 'qr_generate':
                qrGenerateSlideUpRef.current?.open();
        }
    }

    const isCOVIDTest = (patientKeyCOVID && patientDataCOVID && selectedTest === 'covid');
    const isFibrinogenTest = (patientKeyFibrinogen && patientDataFibrinogen && selectedTest === 'fibrinogen');

    return (
        <SafeAreaView style={[format.safeArea]}>
            <View style={testSelect.container}>
                <TouchableOpacity onPress={() => setSelectedTest('covid')}
                                  style={[testSelect.button,
                                      selectedTest === 'covid' && {backgroundColor: testSelect.covidColor}]}>
                    <Text style={testSelect.text}>COVID</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTest('fibrinogen')}
                                  style={[testSelect.button,
                                      selectedTest === 'fibrinogen' && {backgroundColor: testSelect.fibrinogenColor}]}>
                    <Text style={testSelect.text}>Fibrinogen</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={patientSelect.container} onPress={() => {
                    if (selectedTest === 'covid') {
                        setCOVIDPatientModalVisible(true);
                    } else if (selectedTest === 'fibrinogen') {
                        setFibrinogenPatientModalVisible(true);
                    }}}>
                <Text style={patientSelect.text}>Select</Text>
                <IconFA name='user' size={24} style={patientSelect.icon}/>
            </TouchableOpacity>
            <View style={[format.page]}>
                <ScrollView>
                    {
                        (isCOVIDTest)
                            ? <>
                                <View style={format.utilityPatientBarContainer}>
                                    <Text style={fonts.sectionText}>{patientDataCOVID.name}</Text>
                                    <TouchableOpacity style={format.utilityBarButton}
                                                      onPress={() => editCOVIDSlideUpRef.current?.open()}>
                                        <Text style={patientSelect.text}>Edit</Text>
                                        <IconA name='edit' size={20} style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
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
                                    <Text style={[fonts.sectionText, {alignSelf: 'center', paddingLeft: 15}]}>
                                        {patientDataFibrinogen.name}
                                    </Text>
                                    <TouchableOpacity style={format.utilityBarButton}
                                                      onPress={() => editFibrinogenSlideUpRef.current?.open()}>
                                        <Text style={patientSelect.text}>Edit</Text>
                                        <IconA name='edit' size={20}
                                               style={{color: '#555', alignSelf: 'center', marginLeft: 8}}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={format.section}>
                                    {
                                        (patientDataFibrinogen.bloodType)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Blood Type</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.bloodType}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.sex)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Sex</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.sex}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.age)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Age</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.age}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.weight)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Weight</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.weight}</Text>
                                            </View>
                                            : null
                                    }
                                    {
                                        (patientDataFibrinogen.height)
                                            ? <View style={format.field}>
                                                <Text style={fonts.fieldName}>Height</Text>
                                                <Text style={fonts.mediumText}>{patientDataFibrinogen.height}</Text>
                                            </View>
                                            : null
                                    }
                                </View>
                                {
                                    (patientFibrinogenTests.length > 0)
                                        ? <>
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

            <SignInSignUp modalRef={signInSignUpSlideUpRef} />
            <Account modalRef={accountSlideUpRef}
                     editModalRef={editAccountSlideUpRef} />
            <EditAccount modalRef={editAccountSlideUpRef}
                         accountRef={accountSlideUpRef} />
            <Organization modalRef={organizationSlideUpRef}
                          generateQRRef={qrGenerateSlideUpRef} />

            <CreateCOVID modalRef={createCOVIDSlideUpRef} />
            <CreateFibrinogen modalRef={createFibrinogenSlideUpRef} />
            <EditCOVID modalRef={editCOVIDSlideUpRef}
                       patientKey={patientKeyCOVID} />
            <EditFibrinogen modalRef={editFibrinogenSlideUpRef}
                            patientKey={patientKeyFibrinogen} />

            <QRScanSheet scanSheetRef={qrScanSlideUpRef} />
            <QRCodes modalRef={qrGenerateSlideUpRef} />

        </SafeAreaView>
    );
};

export default Data;