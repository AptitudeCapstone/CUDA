import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {Home} from '../screens/Home';
import {CreatePatient} from '../screens/CreatePatient';
import {Bluetooth} from '../screens/Bluetooth';
import {DeviceScreen} from '../screens/Device';
import {Patients} from '../screens/Patients';
import {Diagnostic} from '../screens/Diagnostic';
import {AllResults} from '../screens/AllResults';
import {Results} from '../screens/Results';

const Stack = createStackNavigator();

export const RootNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName='Home'
            screenOptions={{headerTitleAlign: 'center'}}
        >
            <Stack.Screen name='Home' component={Home} options={{headerShown: false}}/>
            <Stack.Screen name='NewPatient' component={CreatePatient} options={{ title: 'Create a New Patient' }} />
            <Stack.Screen name='Bluetooth' component={Bluetooth} options={{ title: 'Connect to a reader' }}/>
            <Stack.Screen name='Device' component={DeviceScreen} />
            <Stack.Screen name='Patients' component={Patients} options={{ title: 'All Patients' }}/>
            <Stack.Screen name='Diagnostic' component={Diagnostic} options={{ title: 'Run a Test' }}/>
            <Stack.Screen name='Results' component={AllResults} options={{ title: 'Test Results' }}/>
            <Stack.Screen name='AllResults' component={AllResults} options={{ title: 'Test Results' }}/>
        </Stack.Navigator>
    </NavigationContainer>
);