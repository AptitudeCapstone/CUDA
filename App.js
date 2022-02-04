import React from 'react';

import {Home} from './src/screens/home/Home';
import {CreateAccount} from './src/screens/home/CreateAccount';
import {SignIn} from './src/screens/home/SignIn';
import {EditAccount} from './src/screens/home/EditAccount';
import {ForgotPassword} from './src/screens/home/ForgotPassword';
import {ConnectOrganization} from './src/screens/home/ConnectOrganization';
import {CreateOrganization} from './src/screens/home/CreateOrganization';
import {Patient} from './src/screens/patients/Patient';
import {StartTest} from './src/screens/diagnostic/StartTest';
import {CreatePatientCOVID} from './src/screens/patients/CreatePatientCOVID';
import {CreatePatientFibrinogen} from './src/screens/patients/CreatePatientFibrinogen';
import {EditPatientCOVID} from './src/screens/patients/EditPatientCOVID';
import {EditPatientFibrinogen} from './src/screens/patients/EditPatientFibrinogen';
import {DeviceScreen} from "./src/screens/Device";
import {Welcome} from "./src/screens/Welcome";
import {NavigationContainer} from '@react-navigation/native';
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
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Sign In'
                component={SignIn}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Edit Account'
                component={EditAccount}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Forgot Password'
                component={ForgotPassword}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Create Organization'
                component={CreateOrganization}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Connect Organization'
                component={ConnectOrganization}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
        </Stack.Navigator>
    );
}

const PatientStack = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name='Patient'
                component={Patient}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name='Create Patient COVID'
                component={CreatePatientCOVID}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Create Patient Fibrinogen'
                component={CreatePatientFibrinogen}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Edit Patient COVID'
                component={EditPatientCOVID}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
            />
            <Stack.Screen
                name='Edit Patient Fibrinogen'
                component={EditPatientFibrinogen}
                options={{title: '', headerTintColor: '#fff', headerStyle: {backgroundColor: '#222'}}}
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
                component={PatientStack}
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
                component={StartTest}
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
