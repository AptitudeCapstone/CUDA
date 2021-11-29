import React, {useEffect, useState} from 'react';
import {Animated, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {format, parseISO} from 'date-fns';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const COVID = ({route, navigation}) => {
    const {patient_id} = route.params;

    let [covidTests, setCovidTests] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=0 AND patient_id=' + patient_id,
                [],
                (tx, results) => {
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));
                    setCovidTests(temp);
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
                    backgroundColor: '#ccc'
                }}
            />
        );
    };


    let covidListItemView = (item) => {
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
            }).start(() => setCovidTests(prevState => prevState.filter(e => e.test_id !== item.test_id)))
        }

        return (
            <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                <Animated.View style={{flex: 1, backgroundColor: '#444'}}>
                    <View
                        key={item.test_id}
                        style={{backgroundColor: '#444', flexDirection: 'row', flex: 1}}>
                        {/*<Text style={styles.text}>Test ID: {item.test_id}</Text>*/}
                        <View style={styles.patientID}>
                            <Text style={styles.patientIDText}>{item.patient_id}</Text>
                        </View>
                        <View style={styles.result}>
                            {/*<Text style={styles.text}>Test Type: {item.test_type}</Text>*/}
                            <Text
                                style={styles.resultText}>{(item.test_result == 0) ? '-' : '+'}
                            </Text>
                        </View>
                        <View style={styles.time}>
                            <Text
                                style={styles.timeText}>{format(parseISO(item.test_time), 'MMM d, yyyy, hh:mm:ss aaaa')}</Text>
                        </View>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    };

    let fibListItemView = (item) => {
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
            }).start(() => setCovidTests(prevState => prevState.filter(e => e.test_id !== item.test_id)))
        }


        return (
            <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                <Animated.View style={{flex: 1, backgroundColor: '#444'}}>
                    <View
                        key={item.test_id}
                        style={{backgroundColor: '#444', flexDirection: 'row', flex: 1}}>
                        {/*<Text style={styles.text}>Test ID: {item.test_id}</Text>*/}
                        <View style={styles.patientID}>
                            <Text style={styles.patientIDText}>{item.patient_id}</Text>
                        </View>
                        <View style={styles.result}>
                            {/*<Text style={styles.text}>Test Type: {item.test_type}</Text>*/}
                            <Text style={styles.fibResultText}>{item.test_result} mg/mL
                            </Text>
                        </View>
                        <View style={styles.time}>
                            <Text
                                style={styles.timeText}>{format(parseISO(item.test_time), 'MMM d, yyyy, hh:mm:ss aaaa')}</Text>
                        </View>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    };

    let COVIDListHeader = () => {
        return (
            <View style={{backgroundColor: '#444', flexDirection: 'row', flex: 1}}>
                <View style={{flex: 0.25, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Patient ID</Text>
                </View>
                <View style={{flex: 0.25, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Result</Text>
                </View>
                <View style={{flex: 0.5, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Timestamp</Text>
                </View>
            </View>
        )
    }

    let FibListHeader = () => {
        return (
            <View style={{backgroundColor: '#444', flexDirection: 'row', flex: 1}}>
                <View style={{flex: 0.25, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Patient ID</Text>
                </View>
                <View style={{flex: 0.25, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Result</Text>
                </View>
                <View style={{flex: 0.5, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Timestamp</Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: '#222', justifyContent: 'space-between'}}>
                <View style={{flex: 0.47}}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingText}>COVID Tests</Text>
                    </View>
                    <FlatList
                        data={covidTests}
                        ListHeaderComponent={COVIDListHeader}
                        ItemSeparatorComponent={listViewItemSeparator}
                        keyExtractor={(item, index) => item.test_id}
                        renderItem={({item}) => covidListItemView(item)}
                    />
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
        flexDirection: 'row',
    },
    rowHeaderText: {
        fontSize: 14,
        color: '#fff',
        padding: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    patientID: {
        backgroundColor: '#555',
        flex: 0.25,
        textAlign: 'center',
        justifyContent: 'center'
    },
    patientIDText: {
        fontSize: 18,
        color: '#fff',
        padding: 20,
        textAlign: 'center',
    },
    result: {
        backgroundColor: '#666',
        flex: 0.25,
        textAlign: 'center',
        justifyContent: 'center'
    },
    resultText: {
        fontSize: 30,
        color: '#fff',
        padding: 20,
        textAlign: 'center'
    },
    fibResultText: {
        fontSize: 14,
        color: '#fff',
        padding: 20,
        textAlign: 'center'
    },
    time: {
        backgroundColor: '#555',
        flex: 0.5,
        textAlign: 'center',
        justifyContent: 'center'
    },
    timeText: {
        fontSize: 14,
        color: '#fff',
        padding: 20,
        textAlign: 'center'
    },
    text: {
        fontSize: 14,
        color: '#fff',
        padding: 20,
        textAlign: 'center'
    },
    headingContainer: {
        backgroundColor: '#333',
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        flexDirection: 'row',
    },
    headingText: {
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
        fontWeight: 'bold'
    },
});