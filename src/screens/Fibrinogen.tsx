import React, {useEffect, useState} from 'react';
import {Animated, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {LineChart} from "react-native-chart-kit";
import {format, parseISO} from 'date-fns';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {
}, error => {
    console.log('ERROR: ' + error)
});

export const Fibrinogen = ({route, navigation}) => {
    const {patient_id} = route.params;

    let [fibTests, setFibTests] = useState([]);
    let [fibVals, setFibVals] = useState([]);
    let [fibTimes, setFibTimes] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=1 AND patient_id=' + (patient_id),
                [],
                (tx, results) => {
                    var temp = [];
                    var temp2 = [];
                    var temp3 = [];

                    for (let i = 0; i < results.rows.length; ++i)
                        temp.push(results.rows.item(i));

                    setFibTests(temp);

                    for (const row of temp) {
                        //console.log(row);
                        temp2.push(parseInt((row['test_result'])));
                        temp3.push(row['test_time']);
                    }

                    setFibVals(temp2);
                    setFibTimes(temp3);

                }
            );
        });
    }, []);

    let listViewItemSeparator = () => {
        return (
            <View
                style={{
                    marginLeft: '5%',
                    marginRight: '5%',
                    height: 1,
                    width: '90%',
                    backgroundColor: '#ccc'
                }}
            />
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
            }).start(() => setFibTests(prevState => prevState.filter(e => e.test_id !== item.test_id)))
        }

        return (
            <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                <Animated.View style={{flex: 1}}>
                    <View
                        key={item.test_id}
                        style={{flexDirection: 'row', flex: 1}}>
                        <View style={styles.result}>
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

    let FibListHeader = () => {
        return (
            <View style={{flexDirection: 'row', flex: 1}}>
                <View style={{flex: 0.4, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Result</Text>
                </View>
                <View style={{flex: 0.6, justifyContent: 'center'}}>
                    <Text style={styles.rowHeaderText}>Timestamp</Text>
                </View>
            </View>
        )
    }

    const screenWidth = Dimensions.get('window').width;

    const chartConfig = {
        backgroundGradientFrom: "#1E2923",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#08130D",
        backgroundGradientToOpacity: 0.2,
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    };

    const data = {
        labels: fibTimes,
        datasets: [{
            data: fibVals
        }]
    };

    const dataEmpty = {
        labels: ['0'],
        datasets: [{
            data: [0]
        }]
    };

    console.log(fibVals);
    console.log(fibTimes);

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: '#222', justifyContent: 'space-between'}}>
                <View style={{flex: 0.4}}>
                    <FlatList
                        data={fibTests}
                        ListHeaderComponent={FibListHeader}
                        ItemSeparatorComponent={listViewItemSeparator}
                        keyExtractor={(item, index) => item.test_id}
                        renderItem={({item}) => fibListItemView(item)}
                    />
                </View>
                <View style={{flex: 0.6, padding: 15}}>
                    <LineChart
                        data={(fibVals.length == 0) ? dataEmpty : data}
                        width={screenWidth} // from react-native
                        height={400}
                        chartConfig={chartConfig}
                        bezier
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

        flex: 0.4,
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

        flex: 0.6,
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