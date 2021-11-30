import React, {useEffect, useState} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Modal,
    TouchableOpacity, KeyboardAvoidingView
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/AntDesign';
import {useIsFocused} from "@react-navigation/native";

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const EditPatient = ({route, navigation}) => {

    const {patient_id, patient_name, patient_phone, patient_address} = route.params;

    let [patientName, setPatientName] = useState(patient_name);
    let [patientPhone, setPatientPhone] = useState(patient_phone);
    let [patientAddress, setPatientAddress] = useState(patient_address);

    let [nameModalValue, setNameModalValue] = useState(patient_name);
    let [phoneModalValue, setPhoneModalValue] = useState(patient_phone);
    let [addressModalValue, setAddressModalValue] = useState(patient_address);

    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    // this is run once each time screen is opened
    const isFocused = useIsFocused();
    useEffect(() => {
        setPatientName(nameModalValue);
        setPatientPhone(phoneModalValue);
        setPatientAddress(addressModalValue);
    },[isFocused]);

    let update_name = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set patient_name=? where patient_id=?',
                [nameModalValue, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) {
                        console.log('Patient update failed');
                    }
                }
            );
        });

        setNameModalVisible(!nameModalVisible);
    };

    let update_phone = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set patient_contact=? where patient_id=?',
                [phoneModalValue, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) {
                        console.log('Patient update failed');
                    }
                }
            );
        });

        setPhoneModalVisible(!phoneModalVisible);
    };

    let update_address = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE table_patients set patient_address=? where patient_id=?',
                [addressModalValue, patient_id],
                (tx, results) => {
                    if (results.rowsAffected <= 0) {
                        console.log('Patient update failed');
                    }
                }
            );
        });

        setAddressModalVisible(!addressModalVisible);
    };


    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <Modal
                visible={nameModalVisible}
                transparent={true}
                style={{justifyContent:'center'}}
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
                    }}>
                    <Text style={styles.headingText}>Enter new name</Text>
                    <TextInput
                        value={nameModalValue}
                        onChangeText={setNameModalValue}
                        placeholder={'Enter text'}
                        style={{backgroundColor: '#fff', padding: 15, margin: 10}}
                        autoComplete='off'
                        autoCorrect={false}
                    />
                    <View style={{ flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                        <TouchableOpacity style={{backgroundColor: '#666', margin: 10, padding: 20}} onPress={() => setNameModalVisible(!nameModalVisible)}><Text style={{color: '#fff'}}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor: '#2cd46a', margin: 10, padding: 20}} onPress={update_name}><Text style={{color: '#fff'}}>Apply</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={phoneModalVisible} transparent={true} style={{justifyContent:'center'}}>
                <View
                    style={{
                        marginTop: 100,
                        paddingLeft: 30,
                        paddingRight: 30,
                        width: '80%',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#444',
                    }}>
                    <Text style={styles.headingText}>Enter new number</Text>
                    <TextInput
                        value={phoneModalValue.toString()}
                        onChangeText={setPhoneModalValue}
                        placeholder={'Enter phone'}
                        maxLength={10}
                        keyboardType="numeric"
                        style={{backgroundColor: '#fff', padding: 15, margin: 10}}
                    />
                    <View style={{ flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                        <TouchableOpacity style={{backgroundColor: '#666', margin: 10, padding: 20}} onPress={() => setPhoneModalVisible(!phoneModalVisible)}><Text style={{color: '#fff'}}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor: '#2cd46a', margin: 10, padding: 20}} onPress={update_phone}><Text style={{color: '#fff'}}>Apply</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={addressModalVisible} transparent={true} style={{justifyContent:'center'}}>
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
                        value={addressModalValue}
                        onChangeText={setAddressModalValue}
                        placeholder={'Enter address'}
                        style={{backgroundColor: '#fff', padding: 15, margin: 10}}
                        autoComplete='off'
                        autoCorrect={false}
                    />
                    <View style={{ flexDirection: 'row', alignSelf: 'center', margin: 10}}>
                        <TouchableOpacity style={{backgroundColor: '#666', margin: 10, padding: 20}} onPress={() => setAddressModalVisible(!addressModalVisible)}><Text style={{color: '#fff'}}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor: '#2cd46a', margin: 10, padding: 20}} onPress={update_address}><Text style={{color: '#fff'}}>Apply</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <KeyboardAvoidingView style={styles.page}>
                <View style={styles.page}>
                    <View styles={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>Name </Text>
                            <Text style={{textAlign: 'right'}}>
                                <Icon onPress={() => setNameModalVisible(!nameModalVisible)} name='edit' size={36}
                                      color='#fff'/>
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{patient_name}</Text>
                        </View>
                    </View>
                    <View styles={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>Phone Number</Text>
                            <Text style={{textAlign: 'right'}}>
                                <Icon onPress={() => setPhoneModalVisible(!phoneModalVisible)} name='edit' size={36}
                                      color='#fff'/>
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{patient_phone}</Text>
                        </View>
                    </View>
                    <View styles={styles.section}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>Email Address</Text>
                            <Text style={{textAlign: 'right'}}>
                                <Icon onPress={() => setAddressModalVisible(!addressModalVisible)} name='edit' size={36}
                                      color='#fff'/>
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>{patient_address}</Text>
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