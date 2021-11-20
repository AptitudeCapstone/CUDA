import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {Home} from '../screens/Home';
import {CreatePatient} from '../screens/CreatePatient';
import {EditPatient} from '../screens/EditPatient';
import {DeviceScreen} from '../screens/Device';
import {Patients} from '../screens/Patients';
import {Patient} from '../screens/Patient';
import {Diagnostic} from '../screens/Diagnostic';
import {AllResults} from '../screens/AllResults';
import {COVID} from '../screens/COVID';
import {Fibrinogen} from '../screens/Fibrinogen';
import {QRCodes} from '../screens/QRCodes';

const Stack = createStackNavigator();

export const RootNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName='Home'
            screenOptions={{headerTitleAlign: 'center'}}
        >
            <Stack.Screen name='Home' component={Home} options={{headerShown: false}}/>
            <Stack.Screen name='NewPatient' component={CreatePatient} options={{title: 'Create a New Patient'}}/>
            <Stack.Screen name='EditPatient' component={EditPatient} options={{title: 'Edit Patient'}}/>
            <Stack.Screen name='Device' component={DeviceScreen}/>
            <Stack.Screen name='Patients' component={Patients} options={{title: 'All Patients'}}/>
            <Stack.Screen name='Patient' component={Patient} options={{title: ''}}/>
            <Stack.Screen name='QRCodes' component={QRCodes} options={{title: 'QR Code Generator'}}/>
            <Stack.Screen name='Diagnostic' component={Diagnostic} options={{title: 'Run a Test'}}/>
            <Stack.Screen name='Results' component={AllResults} options={{title: 'Test Results'}}/>
            <Stack.Screen name='COVID' component={COVID} options={{title: 'COVID Test Results'}}/>
            <Stack.Screen name='Fibrinogen' component={Fibrinogen} options={{title: 'Fibrinogen Test Results'}}/>
            <Stack.Screen name='AllResults' component={AllResults} options={{title: 'Test Results'}}/>
        </Stack.Navigator>
    </NavigationContainer>
);