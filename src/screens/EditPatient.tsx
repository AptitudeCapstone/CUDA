import React, {useEffect, useState} from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    SafeAreaView,
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

    const [patientName, setPatientName] = useState(patient_name);
    const [patientPhone, setPatientPhone] = useState(patient_phone);
    const [patientEmail, setPatientEmail] = useState(patient_email);

    const [nameModalValue, setNameModalValue] = useState(patient_name);
    const [phoneModalValue, setPhoneModalValue] = useState(patient_phone.toString());
    const [emailModalValue, setEmailModalValue] = useState(patient_email);

    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    // this is run once each time screen is opened
    const isFocused = useIsFocused();
    useEffect(() => {
        setPatientName(patient_name);
        setPatientPhone(patient_phone);
        setPatientEmail(patient_email);
        setNameModalValue(patient_name);
        setPhoneModalValue(patient_phone.toString());
        setEmailModalValue(patient_email);
    }, [isFocused]);

    const update_name = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set name=? where id=?',
                [nameModalValue, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) console.log('Patient update failed');
                }
            );
        });

        setPatientName(nameModalValue);
        setNameModalVisible(!nameModalVisible);
    };

    const update_phone = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set phone=? where id=?',
                [phoneModalValue, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) console.log('Patient update failed');
                }
            );
        });

        setPatientPhone(phoneModalValue);
        setPhoneModalVisible(!phoneModalVisible);
    };

    const update_email = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set email=? where id=?',
                [emailModalValue, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) console.log('Patient update failed');
                }
            );
        });

        setPatientEmail(emailModalValue);
        setAddressModalVisible(!addressModalVisible);
    };


    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <Modal
                visible={nameModalVisible}
                transparent={true}
                style={{justifyContent: 'center'}}
            >
                <View
                    style={{
                        marginTop: 100,
                        paddingLeft: 30,
                        paddingRight: 30,
                        width: '80%',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#444',
                    }}
                >
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
                            style={{backgroundColor: '#666', margin: 10, padding: 20}}
                            onPress={() => setNameModalVisible(!nameModalVisible)}
                        >
                            <Text style={{color: '#fff'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{backgroundColor: '#2cd46a', margin: 10, padding: 20}}
                            onPress={update_name}
                        >
                            <Text style={{color: '#fff'}}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={phoneModalVisible} transparent={true} style={{justifyContent: 'center'}}>
                <View
                    style={{
                        marginTop: 100,
                        paddingLeft: 30,
                        paddingRight: 30,
                        width: '80%',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#444',
                    }}
                >
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
                            style={{backgroundColor: '#666', margin: 10, padding: 20}}
                            onPress={() => setPhoneModalVisible(!phoneModalVisible)}
                        >
                            <Text style={{color: '#fff'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{backgroundColor: '#2cd46a', margin: 10, padding: 20}}
                            onPress={update_phone}
                        >
                            <Text style={{color: '#fff'}}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={addressModalVisible}
                transparent={true}
                style={{justifyContent: 'center'}}
            >
                <View
                    style={{
                        marginTop: 100,
                        paddingLeft: 30,
                        paddingRight: 30,
                        width: '80%',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#444',
                    }}
                >
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
                            style={{backgroundColor: '#666', margin: 10, padding: 20}}
                            onPress={() => setAddressModalVisible(!addressModalVisible)}
                        >
                            <Text style={{color: '#fff'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{backgroundColor: '#2cd46a', margin: 10, padding: 20}}
                            onPress={update_email}
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
                            <Text style={{textAlign: 'right'}}>
                                <Icon
                                    onPress={() => setNameModalVisible(!nameModalVisible)}
                                    name='edit'
                                    size={36}
                                    color='#fff'/>
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{patientName}</Text>
                        </View>
                    </View>
                    <View styles={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>Phone Number </Text>
                            <Text style={{textAlign: 'right'}}>
                                <Icon
                                    onPress={() => setPhoneModalVisible(!phoneModalVisible)}
                                    name='edit'
                                    size={36}
                                    color='#fff'/>
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{patientPhone}</Text>
                        </View>
                    </View>
                    <View styles={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>Email Address </Text>
                            <Text style={{textAlign: 'right'}}>
                                <Icon
                                    onPress={() => setAddressModalVisible(!addressModalVisible)}
                                    name='edit'
                                    size={36}
                                    color='#fff'/>
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{patientEmail}</Text>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
    textBox: {
        padding: 25,
        color: '#222',
        backgroundColor: '#eee',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    nameContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    nameText: {
        fontSize: 36,
        color: '#fff',
        textAlign: 'left',
        fontWeight: 'bold'
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