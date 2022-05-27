import React from "react";
import {userScreenOptions} from "../../style/Styles";
import {screenOptions, Stack} from "../Navigator";
import Data from "../../screens/Data";
import CreatePatientCOVID from "../../screens/patient/CreatePatientCOVID";
import CreatePatientFibrinogen from "../../screens/patient/CreatePatientFibrinogen";
import EditPatientCOVID from "../../screens/patient/EditPatientCOVID";
import EditPatientFibrinogen from "../../screens/patient/EditPatientFibrinogen";
import UserStack from "./UserStack";

const DataStack = () => (
    <Stack.Navigator>
        <Stack.Screen name='View Data' title='View Data' component={Data} options={screenOptions}/>
        <Stack.Screen name='Create COVID patient' component={CreatePatientCOVID} options={userScreenOptions}/>
        <Stack.Screen name='Create Fibrinogen Patient' component={CreatePatientFibrinogen} options={userScreenOptions}/>
        <Stack.Screen name='Edit COVID patient' component={EditPatientCOVID} options={userScreenOptions}/>
        <Stack.Screen name='Edit fibrinogen patient' component={EditPatientFibrinogen} options={userScreenOptions}/>
        <Stack.Screen name='User Stack' component={UserStack} options={userScreenOptions}/>
    </Stack.Navigator>
);

export default DataStack;