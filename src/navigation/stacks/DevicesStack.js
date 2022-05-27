import Devices from "../../screens/Devices";
import UserStack from "./UserStack";
import React from "react";
import {screenOptions, Stack} from "../Navigator";

const DevicesStack = () => (
    <Stack.Navigator>
        <Stack.Screen name='Monitor Devices' component={Devices} options={screenOptions}/>
        <Stack.Screen name='User Stack' component={UserStack} options={screenOptions}/>
    </Stack.Navigator>
);

export default DevicesStack;