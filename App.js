import React from 'react';

import {Welcome} from './src/screens/Welcome';
import {Home} from './src/screens/Home';
import {CreateAccount} from './src/screens/CreateAccount';
import {SignIn} from './src/screens/SignIn';
import {EditAccount} from './src/screens/EditAccount';
import {CreateOrganization} from './src/screens/CreateOrganization';
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconFo from 'react-native-vector-icons/Foundation';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
import IconI from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name='Home'
                component={Home}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name='Create Account'
                component={CreateAccount}
                options={{title: 'Create Account', headerTintColor: '#fff', headerStyle: {backgroundColor: '#333'}}}
            />
            <Stack.Screen
                name='Sign In'
                component={SignIn}
                options={{title: 'Sign in', headerTintColor: '#fff', headerStyle: {backgroundColor: '#333'}}}
            />
            <Stack.Screen
                name='Edit Account'
                component={EditAccount}
                options={{title: 'Edit Account', headerTintColor: '#fff', headerStyle: {backgroundColor: '#333'}}}
            />
        </Stack.Navigator>
    );

}

const App = () => {

    return (
        <NavigationContainer>
        <Tab.Navigator
            initialRouteName='HomeStack'
            screenOptions={{
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#ccc",
                tabBarActiveBackgroundColor: "#222",
                tabBarInactiveBackgroundColor: "#222",
                tabBarStyle: [
                    {
                        display: 'flex',
                        backgroundColor: '#222',
                        paddingBottom: 30,
                    }, null
                ],
                paddingTop: 10,
                paddingBottom: 30,
                safeAreaInsets: {
                    bottom: 0,
                },
            }}
        >
            <Tab.Screen
                name='HomeStack'
                component={HomeStack}
                options={{
                    title: 'Home',
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
