import React, {useEffect, useState} from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {LineChart} from "react-native-chart-kit";
import {format, parseISO} from 'date-fns';

var db = openDatabase({name: 'PatientDatabase.db'}, () => {}, error => {console.log('ERROR: ' + error)});

export const Fibrinogen = ({route, navigation}) => {
    const {patient_id} = route.params;

    let [fibTests, setFibTests] = useState([]);
    let [fibVals, setFibVals] = useState([]);
    let [fibTimes, setFibTimes] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM table_tests WHERE test_type=1 AND patient_id=' + patient_id + ' ORDER BY test_time DESC',
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
                        console.log(row['test_time']);
                        temp3.push(format(parseISO(row['test_time']), 'MMM d'));
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
                    height: 0,
                    width: '90%',
                    backgroundColor: '#ccc'
                }}
            />
        );
    };

    let fibListItemView = (item) => {
        const sqlDelete = () => {
            db.transaction(function (tx) {
                tx.executeSql(
                    'DELETE FROM table_tests WHERE test_id=' + item.test_id,
                    [],
                    (tx, results) => {

                    }
                );
            });
        }

        const animatedDelete = () => {
            Alert.alert(
                "Are your sure?",
                "This will permanently delete the test result",
                [
                    {
                        text: "Cancel"
                    },
                    {
                        text: "Confirm",
                        onPress: () => {
                            sqlDelete();
                            const height = new Animated.Value(70);
                            Animated.timing(height, {
                                toValue: 0,
                                duration: 350,
                                useNativeDriver: false
                            }).start(() => setFibTests(prevState => prevState.filter(e => e.test_id !== item.test_id)))
                        },
                    },
                ]
            );
        }

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

        return (
            <Swipeable renderRightActions={swipeRight} rightThreshold={-200}>
                <Animated.View style={{flex: 1, paddingLeft: 20, paddingRight: 20, marginTop: 20, marginBottom: 20}}>
                    <View
                        key={item.test_id}
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
                            <Text
                                style={styles.timeText}>{format(parseISO(item.test_time), 'MMM d @ hh:mm:ss aaaa')}</Text>
                        </View>
                        <View style={{padding: 20}}>
                            <Text style={styles.text}>{item.test_result} mg/mL</Text>
                        </View>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    };

    const screenWidth = Dimensions.get('window').width;

    const chartConfig = {
        backgroundGradientFrom: "#111",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#222",
        backgroundGradientToOpacity: 0.2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
        <SafeAreaView style={{flex: 1, backgroundColor: '#222',}}>
            <View style={{flex: 1, backgroundColor: '#222', justifyContent: 'space-between'}}>
                <View style={{flex: 0.4}}>
                    <FlatList
                        data={fibTests}
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
                        withInnerLines={false}
                        withOuterLines={false}
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
        fontSize: 22,
        fontWeight: 'bold',
        paddingTop: 4,
        paddingBottom: 14,
        color: '#fff',
        flex: 1,
        textAlign: 'left',
    },
    text: {
        fontSize: 18,
        color: '#eee',
        flex: 1,
        textAlign: 'left',
        paddingTop: 4,
        paddingBottom: 4,
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