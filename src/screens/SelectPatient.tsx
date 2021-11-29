import React, {useEffect, useState} from 'react';
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

    useEffect(() => {
        // start to scan when page is open
        console.log(patientIDs);
    }, []);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#222'}}>
            <View style={styles.page}>
                <View style={styles.section}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>By name</Text>
                    </View>
                    <View style={{
                        backgroundColor: '#333', alignItems: 'center',
                        paddingTop: 30, height: 180
                    }}>
                        <ScrollPicker
                            currentValue={patientID}
                            extraData={patientID}
                            list={patientIDs}
                            onItemPress={setPatientID}
                            labelColor='#aaa'
                            separatorColor='#aaa'
                            selectedColor='#fff'
                        />
                    </View>
                    <View>
                        <SubmitButton title='Select patient' customClick={add_test_result}/>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>or</Text>
                    </View>
                </View>
                <View styles={styles.section}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ScanQR')}
                    >
                        <View style={styles.navButton}>
                            <Text style={styles.headingText}>Scan QR</Text>
                            <Text style={{textAlign: 'right'}}>
                                <Icon onPress={() => navigation.navigate('ScanQR')} name='camera' size={30}
                                      color='#fff'/>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.section}>
                    <View>
                        <AltSubmitButton title='Skip this step' customClick={() => navigation.navigate('Diagnostic')}/>
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
        justifyContent: 'space-between'
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
    navButton: {
        backgroundColor: '#2cd46a',
        padding: 25,
        alignSelf: 'stretch',
        flexDirection: 'row',
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
    }
});