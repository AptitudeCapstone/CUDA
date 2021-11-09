import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {Home} from '../screens/Home';
import {NewPatient} from '../screens/NewPatient';
import {Bluetooth} from '../screens/Bluetooth';
import {DeviceScreen} from '../screens/Device';
import {AllTestResults} from '../screens/PatientData';
import {Patients} from '../screens/Patients';
import {Diagnostic} from '../screens/Diagnostic';

const Stack = createStackNavigator();

export const RootNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{headerTitleAlign: 'center'}}
        >
            <Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
            <Stack.Screen name="NewPatient" component={NewPatient}/>
            <Stack.Screen name="Bluetooth" component={Bluetooth}/>
            <Stack.Screen name="Device" component={DeviceScreen}/>
            <Stack.Screen name="Patients" component={Patients}/>
            <Stack.Screen name="PatientData" component={AllTestResults}/>
            <Stack.Screen name="Diagnostic" component={Diagnostic}/>
        </Stack.Navigator>
    </NavigationContainer>
);