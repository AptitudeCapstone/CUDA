import React from "react";
import {Stack, screenOptions} from '../NavigationOptions';
import Patient from "../../screens/patients/Patient";
import CreatePatientCOVID from "../../screens/patients/CreatePatientCOVID";
import CreatePatientFibrinogen from "../../screens/patients/CreatePatientFibrinogen";
import EditPatientCOVID from "../../screens/patients/EditPatientCOVID";
import EditPatientFibrinogen from "../../screens/patients/EditPatientFibrinogen";
import UserStack from "./UserStack";

const ViewDataStack = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name='View Data'
                title='View Data'
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

export default ViewDataStack;