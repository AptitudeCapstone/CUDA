import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {Welcome} from '../screens/Welcome';
import {Home} from '../screens/Home';
import {CreatePatient} from '../screens/CreatePatient';
import {EditPatient} from '../screens/EditPatient';
import {DeviceScreen} from '../screens/Device';
import {Patient} from '../screens/Patient';
import {Diagnostic} from '../screens/Diagnostic';
import {COVID} from '../screens/COVID';
import {Fibrinogen} from '../screens/Fibrinogen';
import {QRCodes} from '../screens/QRCodes';

const Stack = createStackNavigator();

export const RootNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName='Welcome'
            screenOptions={{headerTitleAlign: 'center', headerShadowVisible: false}}
        >
            <Stack.Screen
                name='Welcome'
                component={Welcome}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name='Home'
                component={Home}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name='NewPatient'
                component={CreatePatient}
                options={{
                    title: 'Register Patient',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen
                name='EditPatient'
                component={EditPatient}
                options={{
                    title: 'Edit Patient',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen
                name='Device'
                component={DeviceScreen}
            />
            <Stack.Screen
                name='Patient'
                component={Patient}
                options={{
                    title: '',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen
                name='QRCodes'
                component={QRCodes}
                options={{
                    title: 'Generate QR Codes',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen
                name='Diagnostic'
                component={Diagnostic}
                options={{
                    title: 'Run a Test',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen
                name='COVID'
                component={COVID}
                options={{
                    title: 'COVID Test Results',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
            <Stack.Screen
                name='Fibrinogen'
                component={Fibrinogen}
                options={{
                    title: 'Fibrinogen Test Results',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTintColor: '#eee',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
        </Stack.Navigator>
    </NavigationContainer>
);