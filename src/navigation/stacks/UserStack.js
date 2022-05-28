import React from 'react';
import {Stack} from "../Navigator";
import CreateAccount from '../../screens/user/CreateAccount.js';
import SignIn from '../../screens/user/SignIn';
import EditAccount from '../../screens/user/EditAccount';
import ForgotPassword from '../../screens/user/ForgotPassword';
import CreateOrganization from '../../screens/user/CreateOrganization';
import ConnectOrganization from '../../screens/user/ConnectOrganization';
import {userScreenOptions} from "../../style/Styles";

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