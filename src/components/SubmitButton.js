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
            <Text style={{textAlign: 'right'}}>
                <Icon name='arrowright' size={30}
                      color='#fff'/>
            </Text>
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
            <Text style={{textAlign: 'right'}}>
                <Icon name='arrowright' size={30}
                      color='#fff'/>
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    altSubmitButton: {
        backgroundColor: '#d6be38',
        padding: 25,
        alignSelf: 'stretch',
        flexDirection: 'row'
    },
    submitButton: {
        backgroundColor: '#2cd46a',
        padding: 25,
        alignSelf: 'stretch',
        flexDirection: 'row'
    },
    submitButtonText: {
        fontSize: 24,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold'
    },
});

export default SubmitButton;