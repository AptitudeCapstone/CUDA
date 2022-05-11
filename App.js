import React from 'react';

import {CreateAccount} from './src/screens/home/CreateAccount';
import {SignIn} from './src/screens/home/SignIn';
import {EditAccount} from './src/screens/home/EditAccount';
import {ForgotPassword} from './src/screens/home/ForgotPassword';
import {ConnectOrganization} from './src/screens/home/ConnectOrganization';
import {CreateOrganization} from './src/screens/home/CreateOrganization';
import {Patient} from './src/screens/patients/Patient';
import {Monitor} from './src/screens/devices/Monitor';
import {CreatePatientCOVID} from './src/screens/patients/CreatePatientCOVID';
import {CreatePatientFibrinogen} from './src/screens/patients/CreatePatientFibrinogen';
import {EditPatientCOVID} from './src/screens/patients/EditPatientCOVID';
import {EditPatientFibrinogen} from './src/screens/patients/EditPatientFibrinogen';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import IconFo from 'react-native-vector-icons/Foundation';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from "./src/contexts/UserContext.js";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {headerShown: false};

const UserStack = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name='Create Account'
                component={CreateAccount}
                options={screenOptions}
            />
            <Stack.Screen
                name='Sign In'
                component={SignIn}
                options={screenOptions}
            />
            <Stack.Screen
                name='Edit Account'
                component={EditAccount}
                options={screenOptions}
            />
            <Stack.Screen
                name='Forgot Password'
                component={ForgotPassword}
                options={screenOptions}
            />
            <Stack.Screen
                name='Create Organization'
                component={CreateOrganization}
                options={screenOptions}
            />
            <Stack.Screen
                name='Connect Organization'
                component={ConnectOrganization}
                options={screenOptions}
            />
        </Stack.Navigator>
    );
};

const PatientStack = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name='Patient'
                component={Patient}
                options={screenOptions}
            />
            <Stack.Screen
                name='Create Patient COVID'
                component={CreatePatientCOVID}
                options={screenOptions}
            />
            <Stack.Screen
                name='Create Patient Fibrinogen'
                component={CreatePatientFibrinogen}
                options={screenOptions}
            />
            <Stack.Screen
                name='Edit Patient COVID'
                component={EditPatientCOVID}
                options={screenOptions}
            />
            <Stack.Screen
                name='Edit Patient Fibrinogen'
                component={EditPatientFibrinogen}
                options={screenOptions}
            />
            <Stack.Screen
                name='User Stack'
                component={UserStack}
                options={screenOptions}
            />
        </Stack.Navigator>
    );
}

const MonitorTab = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='MonitorDevices'
                component={Monitor}
                options={screenOptions}
            />
            <Stack.Screen
                name='User Stack'
                component={UserStack}
                options={screenOptions}
            />
        </Stack.Navigator>
    );
}

const App = () => {
    return (
        <UserProvider>
            <NavigationContainer>
                <Tab.Navigator
                    initialRouteName='MonitorTab'
                    screenOptions={{
                        headerShown: false,
                        tabBarActiveTintColor: "#fff",
                        tabBarInactiveTintColor: "#ccc",
                        tabBarActiveBackgroundColor: '#131313',
                        tabBarInactiveBackgroundColor: '#131313',
                        tabBarStyle: [
                            {
                                borderTopColor: '#555',
                                display: 'flex',
                                backgroundColor: '#131313',
                                paddingBottom: 30,
                                paddingTop: 15
                            }, null
                        ],
                        paddingTop: 15,
                        paddingBottom: 30,
                        safeAreaInsets: {
                            bottom: 0,
                        },
                    }}
                >
                    <Tab.Screen
                        name='MonitorTab'
                        component={MonitorTab}
                        options={{
                            title: 'Monitor Devices',
                            headerShown: false,
                            tabBarIcon: ({color}) => (
                                <IconMI
                                    name="device-hub"
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
                            title: 'View Data',
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
                </Tab.Navigator>
            </NavigationContainer>
        </UserProvider>
    );
};

export default App;
