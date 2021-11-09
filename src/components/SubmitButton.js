import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SubmitButton = (props) => {
    return (
        <TouchableOpacity
            style={styles.submitButton}
            onPress={props.customClick}>
            <Text style={styles.submitButtonText}>
                {props.title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    submitButton: {
        backgroundColor: '#2cd46a',
        padding: 25,
        alignSelf: 'stretch'
    },
    submitButtonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default SubmitButton;