import React from "react";
import {Stack, screenOptions} from '../NavigationOptions';
import ViewData from "../../../screens/ViewData";
import CreatePatientCOVID from "../../../screens/patient_management/CreatePatientCOVID";
import CreatePatientFibrinogen from "../../../screens/patient_management/CreatePatientFibrinogen";
import EditPatientCOVID from "../../../screens/patient_management/EditPatientCOVID";
import EditPatientFibrinogen from "../../../screens/patient_management/EditPatientFibrinogen";
import UserStack from "./UserStack";

const ViewDataStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name='View Data'
            title='View Data'
            component={ViewData}
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

export default ViewDataStack;