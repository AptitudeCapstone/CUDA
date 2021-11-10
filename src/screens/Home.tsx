import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native/Libraries/Components/SafeAreaView/SafeAreaView';
import Icon from 'react-native-vector-icons/AntDesign';
import {Device} from "react-native-ble-plx";

export const Home = ({navigation}) => {
    return (
        <SafeAreaView style={styles.page}>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Device Connection</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('Bluetooth', {device: Device})} name="plus" size={24}
                              color="#222"/>
                    </Text>
                </View>
                <View style={styles.subheadingContainer}>
                    <Text style={styles.subheadingText}>Not connected</Text>
                </View>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Patients</Text>
                    <Text style={{textAlign: 'right'}}>
                        <Icon onPress={() => navigation.navigate('NewPatient', {device: Device})} name="plus" size={24}
                              color="#222"/>
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Patients')}
                >
                    <Text style={styles.navButtonText}>View all patients</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Patients')}
                >
                    <Text style={styles.navButtonText}>View recently tested patients</Text>
                </TouchableOpacity>
            </View>
            <View styles={styles.section}>
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Test Results</Text>
                </View>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('AllTestResults')}
                >
                    <Text style={styles.navButtonText}>Select a patient to view</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('AllTestResults')}
                >
                    <Text style={styles.navButtonText}>View recent tests</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('AllTestResults')}
                >
                    <Text style={styles.navButtonText}>View all tests</Text>
                </TouchableOpacity>
            </View>
            <View styles={styles.section}>
                <View style={styles.testButtonContainer}>
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => navigation.navigate('Diagnostic')}
                    >
                        <Text style={styles.testButtonText}>Begin a Test</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#eee',
        flex: 1,
        justifyContent: 'space-between'
    },
    section: {
        flexDirection: 'row',
    },
    headingContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 18,
        color: '#222',
        flex: 1,
        textAlign: 'left',
    },
    subheadingContainer: {
        paddingTop: 0,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    subheadingText: {
        fontSize: 14,
        color: '#222',
        flex: 1,
        textAlign: 'left',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
        textAlign: 'center',
    },
    navButton: {
        backgroundColor: '#4287f5',
        padding: 15,
        alignSelf: 'stretch',
        borderBottomWidth: 4,
        borderBottomColor: '#326dc9',
    },
    navButtonText: {
        fontSize: 14,
        color: '#eee',
        textAlign: 'left',
    },
    testButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        backgroundColor: '#2cd46a',
        padding: 25,
        alignSelf: 'stretch'
    },
    testButtonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});