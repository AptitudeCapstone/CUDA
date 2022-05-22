import React from "react";
import {Stack, screenOptions, userScreenOptions} from '../NavigationOptions';
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
            options={userScreenOptions}
        />
        <Stack.Screen
            name='Create Patient Fibrinogen'
            component={CreatePatientFibrinogen}
            options={userScreenOptions}
        />
        <Stack.Screen
            name='Edit Patient COVID'
            component={EditPatientCOVID}
            options={userScreenOptions}
        />
        <Stack.Screen
            name='Edit Patient Fibrinogen'
            component={EditPatientFibrinogen}
            options={userScreenOptions}
        />
        <Stack.Screen
            name='User Stack'
            component={UserStack}
            options={userScreenOptions}
        />
    </Stack.Navigator>
);

export default ViewDataStack;