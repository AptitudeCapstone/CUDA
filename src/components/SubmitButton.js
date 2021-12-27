import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

export const SubmitButton = (props) => {
    return (
        <TouchableOpacity
            style={styles.submitButton}
            onPress={props.customClick}>
            <Text style={styles.submitButtonText}>
                {props.title}
            </Text>
            <Icon name='arrowright' size={30}
                  color='#fff'/>
        </TouchableOpacity>
    );
};

export const AltSubmitButton = (props) => {
    return (
        <TouchableOpacity
            style={styles.altSubmitButton}
            onPress={props.customClick}>
            <Text style={styles.submitButtonText}>
                {props.title}
            </Text>
            <Icon name='arrowright' size={30}
                  color='#fff'/>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    altSubmitButton: {
        backgroundColor: '#d6be38',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
    },
    submitButton: {
        backgroundColor: '#2cd46a',
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 25,
        paddingBottom: 25,
        flexDirection: 'row',
        borderRadius: 50,
    },
    submitButtonText: {
        fontSize: 24,
        color: '#fff',
        paddingRight: 24,
        textAlign: 'center',
        fontWeight: 'bold'
    },
});

export default SubmitButton;