import React from 'react';
import {Stack} from "../Navigator";
import CreateAccount from '../../screens/user_sheets/CreateAccount.js';
import SignIn from '../../screens/user_sheets/SignIn';
import EditAccount from '../../screens/user_sheets/EditAccount';
import ForgotPassword from '../../screens/user_sheets/ForgotPassword';
import CreateOrganization from '../../screens/user_sheets/CreateOrganization';
import ConnectOrganization from '../../screens/user_sheets/ConnectOrganization';
import {userScreenOptions} from "../../style/Styles";

const UserStack = () => (
    <Stack.Navigator>
        <Stack.Screen name='Create account' component={CreateAccount} options={userScreenOptions}/>
        <Stack.Screen name='Sign in' component={SignIn} options={userScreenOptions}/>
        <Stack.Screen name='Edit account' component={EditAccount} options={userScreenOptions}/>
        <Stack.Screen name='Forgot password' component={ForgotPassword} options={userScreenOptions}/>
        <Stack.Screen name='Create organization' component={CreateOrganization} options={userScreenOptions}/>
        <Stack.Screen name='Connect organization' component={ConnectOrganization} options={userScreenOptions}/>
    </Stack.Navigator>
)

export default UserStack;