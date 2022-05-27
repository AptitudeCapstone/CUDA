import React from 'react';
import {Stack} from "../TabNavigator";
import CreateAccount from '../../../screens/user_management/CreateAccount.js';
import SignIn from '../../../screens/user_management/SignIn';
import EditAccount from '../../../screens/user_management/EditAccount';
import ForgotPassword from '../../../screens/user_management/ForgotPassword';
import CreateOrganization from '../../../screens/user_management/CreateOrganization';
import ConnectOrganization from '../../../screens/user_management/ConnectOrganization';
import {userScreenOptions} from "../../../Styles";

const UserStack = () => (
    <Stack.Navigator>
        <Stack.Screen name='Create Account' component={CreateAccount} options={userScreenOptions}/>
        <Stack.Screen name='Sign In' component={SignIn} options={userScreenOptions}/>
        <Stack.Screen name='Edit Account' component={EditAccount} options={userScreenOptions}/>
        <Stack.Screen name='Forgot Password' component={ForgotPassword} options={userScreenOptions}/>
        <Stack.Screen name='Create Organization' component={CreateOrganization} options={userScreenOptions}/>
        <Stack.Screen name='Connect Organization' component={ConnectOrganization} options={userScreenOptions}/>
    </Stack.Navigator>
)

export default UserStack;