import React from 'react';
import {TextInput, View} from 'react-native';

const TextInputField = (props) => {
    return (
        <View
            style={{
                marginLeft: 35,
                marginRight: 35,
                marginTop: 10,
                marginBottom: 20,
                borderColor: '#eee',
                borderWidth: 1,
                borderRadius: 5
            }}>
            <TextInput
                underlineColorAndroid="transparent"
                placeholder={props.placeholder}
                placeholderTextColor="#bbb"
                keyboardType={props.keyboardType}
                onChangeText={props.onChangeText}
                returnKeyType={props.returnKeyType}
                numberOfLines={props.numberOfLines}
                multiline={props.multiline}
                onSubmitEditing={props.onSubmitEditing}
                style={props.style}
                blurOnSubmit={false}
                value={props.value}
            />
        </View>
    );
};

export default TextInputField