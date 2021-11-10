import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export const AllResults = ({navigation}) => {
    return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity
                style={styles.navButton}
            >
                <Text style={styles.navButtonText}>Begin test for a new patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.navButton}
            >
                <Text style={styles.navButtonText}>Begin test for an existing patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.navButton}
            >
                <Text style={styles.navButtonText}>Begin test without patient ID</Text>
            </TouchableOpacity>
        </View>
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