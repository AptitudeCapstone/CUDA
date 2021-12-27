import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AltSubmitButton, SubmitButton} from '../components/SubmitButton';
import {ScrollPicker} from 'react-native-value-picker';
import Icon from 'react-native-vector-icons/AntDesign';

export const SelectPatient = ({route, navigation}) => {
    const {patients, patientIDs} = route.params;

    const [patientID, setPatientID] = useState(1);

    let add_test_result = () => {
        navigation.navigate('Diagnostic', {navigation, patientID})
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <View style={styles.page}>
                <View style={styles.section}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>By name</Text>
                    </View>
                    <View
                        style={{
                            alignItems: 'center',
                            height: 180,
                            paddingBottom: 30,
                            marginBottom: 30,
                        }}
                    >
                        <ScrollPicker
                            currentValue={patientID}
                            extraData={patientID}
                            list={patientIDs}
                            onItemPress={setPatientID}
                            labelColor='#aaa'
                            separatorColor='#aaa'
                            selectedColor='#fff'
                        />
                        <View style={styles.navButtonContainer}>
                            <SubmitButton title='Select patient' customClick={add_test_result}/>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>or</Text>
                    </View>
                </View>
                <View styles={styles.section}>
                    <View style={styles.navButtonContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('ScanQR')}>
                            <View style={styles.navButton}>
                                <Text style={styles.navButtonText}>Scan QR</Text>
                                <Text>
                                    <Icon
                                        onPress={() => navigation.navigate('ScanQR')}
                                        name='camera'
                                        size={30}
                                        color='#fff'
                                    />
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.navButtonContainer}>
                        <AltSubmitButton
                            title='Skip this step'
                            customClick={() => navigation.navigate('Diagnostic')}
                        />
                    </View>
                </View>
            </View>
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
        flexDirection: 'column',
    },
    headingContainer: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 24,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    navButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButton: {
        backgroundColor: '#2cd46a',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
    },
    navButtonText: {
        fontSize: 24,
        color: '#fff',
        paddingRight: 24,
        textAlign: 'center',
        fontWeight: 'bold'
    }
});