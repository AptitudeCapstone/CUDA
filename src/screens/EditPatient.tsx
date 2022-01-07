import React, {useEffect, useState} from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/AntDesign';
import {useIsFocused} from "@react-navigation/native";

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const EditPatient = ({route, navigation}) => {

    const {
        patient_id,
        patient_qr_id,
        patient_name,
        patient_email,
        patient_phone,
        patient_street_address_1,
        patient_street_address_2,
        patient_city,
        patient_state,
        patient_country,
        patient_zip
    } = route.params;

    // database values for current patient
    const [patientQrId, setPatientQrId] = useState(patient_qr_id);
    const [patientName, setPatientName] = useState(patient_name);
    const [patientEmail, setPatientEmail] = useState(patient_email);
    const [patientPhone, setPatientPhone] = useState(patient_phone.toString());
    const [patientStreetAddress1, setPatientStreetAddress1] = useState(patient_street_address_1);
    const [patientStreetAddress2, setPatientStreetAddress2] = useState(patient_street_address_2);
    const [patientCity, setPatientCity] = useState(patient_city);
    const [patientState, setPatientState] = useState(patient_state);
    const [patientCountry, setPatientCountry] = useState(patient_country);
    const [patientZip, setPatientZip] = useState(patient_zip.toString());

    // modal text box values
    const [nameModalValue, setNameModalValue] = useState(patient_name);
    const [emailModalValue, setEmailModalValue] = useState(patient_email);
    const [phoneModalValue, setPhoneModalValue] = useState(patient_phone.toString());
    const [streetAddress1ModalValue, setStreetAddress1ModalValue] = useState(patient_street_address_1);
    const [streetAddress2ModalValue, setStreetAddress2ModalValue] = useState(patient_street_address_2);
    const [cityModalValue, setCityModalValue] = useState(patient_city);
    const [stateModalValue, setStateModalValue] = useState(patient_state);
    const [countryModalValue, setCountryModalValue] = useState(patient_country);
    const [zipModalValue, setZipModalValue] = useState(patient_zip.toString());

    // boolean visibilities for modal editing boxes
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [streetAddress1ModalVisible, setStreetAddress1ModalVisible] = useState(false);
    const [streetAddress2ModalVisible, setStreetAddress2ModalVisible] = useState(false);
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [zipModalVisible, setZipModalVisible] = useState(false);

    // this is run once each time screen is opened
    const isFocused = useIsFocused();
    useEffect(() => {
        setPatientName(patient_name);
        setPatientEmail(patient_email);
        setPatientPhone(patient_phone);
        setPatientStreetAddress1(patient_street_address_1);
        setPatientStreetAddress2(patient_street_address_2);
        setPatientCity(patient_city);
        setPatientState(patient_state);
        setPatientCountry(patient_country);
        setPatientZip(patient_zip);

        setNameModalValue(patient_name);
        setEmailModalValue(patient_email);
        setPhoneModalValue(patient_phone.toString());
        setStreetAddress1ModalValue(patient_street_address_1);
        setStreetAddress2ModalValue(patient_street_address_2);
        setCityModalValue(patient_city);
        setStateModalValue(patient_state);
        setCountryModalValue(patient_country);
        setZipModalValue(patient_zip.toString());
    }, [isFocused]);

    const update = (fieldName) => {
        let value = '';

        switch (fieldName) {
            case 'name':
                value = nameModalValue;
                setPatientName(nameModalValue);
                setNameModalVisible(!nameModalVisible);
                break;
            case 'email':
                value = emailModalValue;
                setPatientEmail(emailModalValue);
                setEmailModalVisible(!emailModalVisible);
                break;
            case 'phone':
                value = phoneModalValue;
                setPatientPhone(phoneModalValue.toString());
                setPhoneModalVisible(!phoneModalVisible);
                break;
            case 'street_address_1':
                value = streetAddress1ModalValue;
                setPatientStreetAddress1(streetAddress1ModalValue);
                setStreetAddress1ModalVisible(!streetAddress1ModalVisible);
                break;
            case 'street_address_2':
                value = streetAddress2ModalValue;
                setPatientStreetAddress2(streetAddress2ModalValue);
                setStreetAddress2ModalVisible(!streetAddress2ModalVisible);
                break;
            case 'city':
                value = cityModalValue;
                setPatientCity(cityModalValue);
                setCityModalVisible(!cityModalVisible);
                break;
            case 'state':
                value = stateModalValue;
                setPatientState(stateModalValue);
                setStateModalVisible(!stateModalVisible);
                break;
            case 'country':
                value = countryModalValue;
                setPatientCountry(countryModalValue);
                setCountryModalVisible(!countryModalVisible);
                break;
            case 'zip':
                value = zipModalValue;
                setPatientZip(zipModalValue.toString());
                setZipModalVisible(!zipModalVisible);
                break;
        }

        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set ' + fieldName + '=? where id=?',
                [value, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) console.log('Patient update failed');
                    else console.log('Updated ' + fieldName + ' with value ' + value.toString())
                }
            );
        });
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <ScrollView style={{flex: 1, backgroundColor: '#222'}}>
                <Modal
                    visible={nameModalVisible}
                    transparent={true}
                    style={{justifyContent: 'center'}}
                >
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter new name</Text>
                        <TextInput
                            value={nameModalValue}
                            onChangeText={setNameModalValue}
                            placeholder={'Enter text'}
                            style={styles.textBox}
                            autoComplete='off'
                            autoCorrect={false}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setNameModalVisible(!nameModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('name')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={emailModalVisible}
                    transparent={true}
                    style={{justifyContent: 'center'}}
                >
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter new email</Text>
                        <TextInput
                            value={emailModalValue}
                            onChangeText={setEmailModalValue}
                            placeholder={'Enter address'}
                            style={styles.textBox}
                            autoComplete='off'
                            autoCorrect={false}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setEmailModalVisible(!emailModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('email')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={phoneModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter new number</Text>
                        <TextInput
                            value={phoneModalValue}
                            onChangeText={setPhoneModalValue}
                            placeholder={'Enter phone'}
                            maxLength={10}
                            keyboardType='numeric'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setPhoneModalVisible(!phoneModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('phone')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={streetAddress1ModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter street address line 1</Text>
                        <TextInput
                            value={streetAddress1ModalValue}
                            onChangeText={setStreetAddress1ModalValue}
                            placeholder={'E.g. 125 Valley Rd.'}
                            keyboardType='default'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setStreetAddress1ModalVisible(!streetAddress1ModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('street_address_1')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={streetAddress2ModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter street address line 2</Text>
                        <TextInput
                            value={streetAddress2ModalValue}
                            onChangeText={setStreetAddress2ModalValue}
                            placeholder={'E.g. Apt. #1'}
                            keyboardType='default'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setStreetAddress2ModalVisible(!streetAddress2ModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('street_address_2')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={cityModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter city</Text>
                        <TextInput
                            value={cityModalValue}
                            onChangeText={setCityModalValue}
                            placeholder={'Enter city'}
                            keyboardType='default'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setCityModalVisible(!cityModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('city')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={stateModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter state</Text>
                        <TextInput
                            value={stateModalValue}
                            onChangeText={setStateModalValue}
                            placeholder={'Enter state'}
                            keyboardType='default'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setStateModalVisible(!stateModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('state')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={countryModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter country</Text>
                        <TextInput
                            value={countryModalValue}
                            onChangeText={setCountryModalValue}
                            placeholder={'Enter country'}
                            keyboardType='default'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setCountryModalVisible(!countryModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('country')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={zipModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                    <View style={styles.modalBox}>
                        <Text style={styles.headingText}>Enter 5-digit zip code</Text>
                        <TextInput
                            value={zipModalValue}
                            onChangeText={setZipModalValue}
                            placeholder={'Enter zip'}
                            maxLength={5}
                            keyboardType='numeric'
                            style={styles.textBox}
                        />
                        <View style={{flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setZipModalVisible(!zipModalVisible)}
                            >
                                <Text style={{color: '#fff'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={() => update('zip')}
                            >
                                <Text style={{color: '#fff'}}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <KeyboardAvoidingView style={styles.page}>
                    <View style={styles.page}>
                        <View styles={styles.section}>
                            <View style={styles.nameContainer}>
                                <Text style={styles.nameText}>Name </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientName}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setNameModalVisible(!nameModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                        </View>
                        <View styles={styles.section}>
                            <View style={styles.nameContainer}>
                                <Text style={styles.nameText}>Contact</Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientPhone}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setPhoneModalVisible(!phoneModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientEmail}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setEmailModalVisible(!emailModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                        </View>
                        <View styles={styles.section}>
                            <View style={styles.nameContainer}>
                                <Text style={styles.nameText}>Address</Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientStreetAddress1}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setStreetAddress1ModalVisible(!streetAddress1ModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientStreetAddress2}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setStreetAddress2ModalVisible(!streetAddress2ModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientCity}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setCityModalVisible(!cityModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientState}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setStateModalVisible(!stateModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientCountry}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setCountryModalVisible(!countryModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{patientZip}</Text>
                                <Text style={{textAlign: 'right'}}>
                                    <Icon
                                        onPress={() => setZipModalVisible(!zipModalVisible)}
                                        name='edit'
                                        size={26}
                                        color='#fff'/>
                                </Text>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
    modalBox: {
        marginTop: 100,
        paddingLeft: 30,
        paddingRight: 30,
        width: '80%',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#444',
    },
    modalCancelButton: {
        backgroundColor: '#666',
        margin: 10,
        padding: 20
    },
    modalSubmitButton: {
        backgroundColor: '#2cd46a',
        margin: 10,
        padding: 20
    },
    textBox: {
        padding: 25,
        color: '#222',
        backgroundColor: '#eee',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    nameContainer: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    valueContainer: {
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    nameText: {
        fontSize: 30,
        color: '#fff',
        textAlign: 'left',
        fontWeight: 'bold'
    },
    valueText: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'left',
        paddingRight: 20
    },
    headingContainer: {
        backgroundColor: '#333',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        margin: 40,
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});