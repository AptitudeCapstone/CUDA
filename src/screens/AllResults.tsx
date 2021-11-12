import React, {useEffect, useState} from 'react';
import {Animated, FlatList, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {format} from 'date-fns';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const AllResults = ({navigation}) => {
    let [flatListItems, setFlatListItems] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_tests',
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
                    backgroundColor: '#cccccc'
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

        const animatedDelete = () => {
            const height = new Animated.Value(70)
            Animated.timing(height, {
                toValue: 0,
                duration: 350,
                useNativeDriver: false
            }).start(() => setFlatListItems(prevState => prevState.filter(e => e.test_id !== item.test_id)))
        }


        return (
            <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                <Animated.View style={{flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white'}}>
                    <View
                        key={item.test_id}
                        style={{backgroundColor: 'white', padding: 20}}>
                        <Text>Test ID: {item.test_id}</Text>
                        <Text>Patient ID: {item.patient_id}</Text>
                        <Text>Test Type: {item.test_type}</Text>
                        <Text>Result: {item.test_result}</Text>
                        <Text>Timestamp: {format(item.test_time, 'yyyy-MM-dd HH:mm:ss')}</Text>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <FlatList
                    data={flatListItems}
                    ItemSeparatorComponent={listViewItemSeparator}
                    keyExtractor={(item, index) => item.test_id}
                    renderItem={({item}) => listItemView(item)}
                />
            </View>
        </SafeAreaView>
    );
}