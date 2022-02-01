import React, {useEffect, useState} from 'react';
import {Alert, Animated, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {format, parseISO} from 'date-fns';
import database from "@react-native-firebase/database";

export const COVID = ({route, navigation}) => {
    const {patient_id} = route.params;

    let [covidTests, setCovidTests] = useState([]);

    useEffect(() => {
        database().ref('tests/covid/').orderByChild('date').once('value', function (snapshot) {
            //verify that org with add code exists
            if (snapshot.val()) {
                let temp = [];
                // @ts-ignore
                snapshot.forEach(function (data) {
                    temp.push(data.val());
                });
                setCovidTests(temp);
            }
        })
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

    let covidListItemView = (item) => {
        const sqlDelete = () => {
            database().ref('tests/covid/' + item.test_id)

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
                            }).start(() => setCovidTests(prevState => prevState.filter(e => e.test_id !== item.test_id)))
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
                <TouchableOpacity
                    style={{
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}
                    onPress={animatedDelete}
                >
                    <Animated.View style={{backgroundColor: 'red', justifyContent: 'center'}}>
                        <Animated.Text
                            style={{
                                marginLeft: 25,
                                marginRight: 25,
                                fontSize: 15,
                                fontWeight: 'bold',
                                transform: [{scale}]
                            }}
                        >
                            Delete
                        </Animated.Text>
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
                            <Text style={styles.text}>{(item.test_result == 0) ? 'Negative' : 'Positive'}</Text>
                        </View>
                    </View>
                </Animated.View>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={{flex: 1, backgroundColor: '#222'}}>
                <FlatList
                    data={covidTests}
                    ItemSeparatorComponent={listViewItemSeparator}
                    keyExtractor={(item, index) => item.test_id}
                    renderItem={({item}) => covidListItemView(item)}
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