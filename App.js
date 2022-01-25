import React from 'react';

import {Welcome} from "./src/screens/Welcome";
import {Home} from "./src/screens/Home";
import {CreateOrganization} from "./src/screens/CreateOrganization";
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconF from 'react-native-vector-icons/Feather';
import IconFo from 'react-native-vector-icons/Foundation';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconI from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const App = () => {

    return (
        <NavigationContainer>
        <Tab.Navigator
            initialRouteName='Welcome'
            screenOptions={{
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#ccc",
                tabBarActiveBackgroundColor: "#222",
                tabBarInactiveBackgroundColor: "#222",
                tabBarStyle: [{
                    display: 'flex',
                    backgroundColor: '#222',
                    paddingBottom: 30,
                }, null],
                paddingTop: 10,
                paddingBottom: 30,
                safeAreaInsets: {
                    bottom: 0,
                },
            }}
        >
            <Tab.Screen
                name='Home'
                component={Home}
                options={{
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <IconMCI
                            name="home-outline"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name='PatientData'
                component={Welcome}
                options={{
                    title: 'Patient Data',
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <IconFo
                            name="graph-bar"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name='StartTest'
                component={CreateOrganization}
                options={{
                    title: 'Start Test',
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <IconI
                            name="water"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    </NavigationContainer>
    );
};

export default App;
