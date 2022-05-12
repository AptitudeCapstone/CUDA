import Monitor from "../../screens/devices/Monitor";
import UserStack from "./UserStack";
import React from "react";
import {Stack, screenOptions} from '../NavigationOptions';

const MonitorDevicesStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='Monitor Devices'
                component={Monitor}
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

export default MonitorDevicesStack;