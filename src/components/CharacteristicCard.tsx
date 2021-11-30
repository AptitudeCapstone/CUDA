import React, {useEffect, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Characteristic} from 'react-native-ble-plx';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Base64} from '../lib/base64';

type CharacteristicCardProps = {
    char: Characteristic;
};

const decodeBleString = (value: string | undefined | null): string => {
    if (!value) {
        return '';
    }
    return Base64.decode(value).charCodeAt(0);
};

const CharacteristicCard = ({char}: CharacteristicCardProps) => {
    const [measure, setMeasure] = useState('');
    const [descriptor, setDescriptor] = useState<string | null>('');

    useEffect(() => {
        // discover characteristic descriptors
        char.descriptors().then((desc) => {
            desc[0]?.read().then((val) => {
                if (val) {
                    setDescriptor(Base64.decode(val.value));
                }
            });
        });

        // read on the characteristic
        char.monitor((err, cha) => {
            if (err) {
                console.warn('ERROR');
                return;
            }
            // each received value has to be decoded with a Base64 algorithm you can find on the internet
            setMeasure(decodeBleString(cha?.value));
        });
    }, [char]);

    // write on a characteristic the number 6 (e.g.)
    const writeCharacteristic = () => {
        // encode the string with the Base64 algorithm
        char
            .writeWithResponse(Base64.encode('6'))
            .then(() => {
                console.warn('Success');
            })
            .catch((e) => console.log('Error', e));
    };

    return (
        <TouchableOpacity
            key={char.uuid}
            style={styles.container}
            onPress={writeCharacteristic}>
            <Text style={styles.measure}>{measure}</Text>
            <Text style={styles.descriptor}>{descriptor}</Text>
            <Text style={{color: '#fff'}}>{'isIndicatable: ' + char.isIndicatable}</Text>
            <Text style={{color: '#fff'}}>{'isNotifiable: ' + char.isNotifiable}</Text>
            <Text style={{color: '#fff'}}>{'isNotifying: ' + char.isNotifying}</Text>
            <Text style={{color: '#fff'}}>{'isReadable: ' + char.isReadable}</Text>
            <TouchableOpacity>
                <Text style={{color: '#fff'}}>{'isWritableWithResponse: ' + char.isWritableWithResponse}</Text>
            </TouchableOpacity>
            <Text style={{color: '#fff'}}>{'isWritableWithoutResponse: ' + char.isWritableWithoutResponse}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#333',
        marginVertical: 12,
        borderRadius: 16,
        shadowColor: 'rgba(60,64,67,0.3)',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        padding: 12,
    },
    measure: {color: 'red', fontSize: 24},
    descriptor: {color: 'blue', fontSize: 24},
});

export {CharacteristicCard};
