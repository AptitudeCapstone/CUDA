import React from "react";
import {userScreenOptions} from "../../../Styles";
import {screenOptions, Stack} from "../TabNavigator";
import ViewData from "../../../screens/ViewData";
import CreatePatientCOVID from "../../../screens/patient_management/CreatePatientCOVID";
import CreatePatientFibrinogen from "../../../screens/patient_management/CreatePatientFibrinogen";
import EditPatientCOVID from "../../../screens/patient_management/EditPatientCOVID";
import EditPatientFibrinogen from "../../../screens/patient_management/EditPatientFibrinogen";
import UserStack from "./UserStack";

const ViewDataStack = () => (
    <Stack.Navigator>
        <Stack.Screen name='View Data' title='View Data' component={ViewData} options={screenOptions}/>
        <Stack.Screen name='Create COVID patient' component={CreatePatientCOVID} options={userScreenOptions}/>
        <Stack.Screen name='Create Fibrinogen Patient' component={CreatePatientFibrinogen} options={userScreenOptions}/>
        <Stack.Screen name='Edit COVID patient' component={EditPatientCOVID} options={userScreenOptions}/>
        <Stack.Screen name='Edit fibrinogen patient' component={EditPatientFibrinogen} options={userScreenOptions}/>
        <Stack.Screen name='User Stack' component={UserStack} options={userScreenOptions}/>
    </Stack.Navigator>
);

export default ViewDataStack;