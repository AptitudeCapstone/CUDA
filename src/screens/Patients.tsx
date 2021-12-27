import React, {useEffect, useState} from 'react';
import {Animated, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const Patients = ({navigation}) => {
    let [flatListItems, setFlatListItems] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_patients',
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    setFlatListItems(temp);
                }
            );
        });
    }, []);

    let listViewItemSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#444'
                }}
            />
        );
    };


    let listItemView = (item) => {
        const swipeRight = (progress, dragX) => {
            const scale = dragX.interpolate({
                inputRange: [-200, 0],
                outputRange: [1, 0.5],
                extrapolate: 'clamp'
            })
            return (
                <TouchableOpacity style={{backgroundColor: 'red', justifyContent: 'center', textAlign: 'center',}}
                                  onPress={animatedDelete}>
                    <Animated.View style={{backgroundColor: 'red', justifyContent: 'center'}}>
                        <Animated.Text style={{
                            color: '#fff',
                            marginLeft: 25,
                            marginRight: 25,
                            fontSize: 15,
                            fontWeight: 'bold',
                            transform: [{scale}]
                        }}>Delete</Animated.Text>
                    </Animated.View>
                </TouchableOpacity>
            )
        }

        let sqlDelete = () => {
            db.transaction(function (tx) {
                tx.executeSql(
                    'DELETE FROM table_patients WHERE patient_id=' + patient_id,
                    [],
                    (tx, results) => {
                        console.log('Results', results.rowsAffected);
                    }
                );
                tx.executeSql(
                    'DELETE FROM table_tests WHERE patient_id=' + patient_id,
                    [],
                    (tx, results) => {
                        console.log('Results', results.rowsAffected);
                        navigation.navigate('Home');
                    }
                );
            });
        };

        const animatedDelete = () => {
            sqlDelete();
            const height = new Animated.Value(70);
            Animated.timing(height, {
                toValue: 0,
                duration: 350,
                useNativeDriver: false
            }).start(() => setFlatListItems(prevState => prevState.filter(e => e.patient_id !== item.patient_id)))
        }

        let patient_id = item.patient_id;
        let patient_name = item.patient_name;
        let patient_phone = item.patient_contact;
        let patient_address = item.patient_address;

        return (
            <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Patient', {
                        navigation,
                        patient_id,
                        patient_name,
                        patient_phone,
                        patient_address
                    })}
                >
                    <Animated.View style={{
                        flex: 1,
                        margin: 15,
                        borderRadius: 15,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#333',
                    }}>
                        <View
                            key={item.patient_id}
                            style={{backgroundColor: '#2a2a2a', borderRadius: 15, flex: 1}}
                        >
                            <View style={{
                                backgroundColor: '#353535',
                                padding: 20,
                                paddingBottom: 10,
                                flex: 1,
                                borderTopLeftRadius: 15,
                                borderTopRightRadius: 15
                            }}>
                                <Text style={styles.nameText}>{item.patient_name}</Text>
                            </View>
                            <View style={{padding: 20}}>
                                <Text style={styles.text}>{item.patient_contact}</Text>
                                <Text style={styles.text}>{item.patient_address}</Text>
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={{flex: 1, backgroundColor: '#222'}}>
                <FlatList
                    data={flatListItems}
                    keyExtractor={(item, index) => item.patient_id}
                    renderItem={({item}) => listItemView(item)}
                />
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
        flexDirection: 'row',
    },
    text: {
        fontSize: 18,
        color: '#eee',
        flex: 1,
        textAlign: 'left',
        paddingTop: 4,
        paddingBottom: 4,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingTop: 4,
        paddingBottom: 14,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
    }
});