import React from "react";
import {userScreenOptions} from "../../style/Styles";
import {screenOptions, Stack} from "../Navigator";
import Data from "../../screens/Data";
import UserStack from "./UserStack";

const DataStack = () => (
    <Stack.Navigator>
        <Stack.Screen name='View data' title='Records' component={Data} options={screenOptions}/>
        <Stack.Screen name='User stack' component={UserStack} options={userScreenOptions}/>
    </Stack.Navigator>
);

export default DataStack;