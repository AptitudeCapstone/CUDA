import Monitor from "../../../screens/Monitor";
import UserStack from "./UserStack";
import React from "react";
import {screenOptions, Stack} from '../NavigationOptions';

const MonitorDevicesStack = () => (
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

export default MonitorDevicesStack;