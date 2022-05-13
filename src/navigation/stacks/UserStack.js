import React from 'react';
import {Stack, userScreenOptions} from '../NavigationOptions';
import CreateAccount from '../../screens/home/CreateAccount';
import SignIn from '../../screens/home/SignIn';
import EditAccount from '../../screens/home/EditAccount';
import ForgotPassword from '../../screens/home/ForgotPassword';
import CreateOrganization from '../../screens/home/CreateOrganization';
import ConnectOrganization from '../../screens/home/ConnectOrganization';

const UserStack = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name='Create Account'
                component={CreateAccount}
                options={userScreenOptions}
            />
            <Stack.Screen
                name='Sign In'
                component={SignIn}
                options={userScreenOptions}
            />
            <Stack.Screen
                name='Edit Account'
                component={EditAccount}
                options={userScreenOptions}
            />
            <Stack.Screen
                name='Forgot Password'
                component={ForgotPassword}
                options={userScreenOptions}
            />
            <Stack.Screen
                name='Create Organization'
                component={CreateOrganization}
                options={userScreenOptions}
            />
            <Stack.Screen
                name='Connect Organization'
                component={ConnectOrganization}
                options={userScreenOptions}
            />
        </Stack.Navigator>
    );
};

export default UserStack;