import React from 'react';
import {Image} from "react-native";
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MonitorDevicesStack from './stacks/MonitorDevicesStack'
import ViewDataStack from './stacks/ViewDataStack';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconE from 'react-native-vector-icons/Entypo';
import FastImage from "react-native-fast-image";

const Tab = createBottomTabNavigator();
import {tabNavigatorStyle} from '../../style';

const TabNavigator = () => (
    <NavigationContainer>
        <Tab.Navigator initialRouteName='MonitorTab' screenOptions={tabNavigatorStyle}>
            <Tab.Screen
                name='MonitorTab'
                component={MonitorDevicesStack}
                options={{
                    title: 'Devices',
                    headerShown: false,
                    tabBarIcon: ({size}) => (
                        <Image
                            resizeMode='stretch'
                            style={{width: 30, height: 30}}
                            source={require('../../resources/aptitude-logo.png')}/>
                    ),
                }}
            />
            <Tab.Screen
                name='ViewDataTab'
                component={ViewDataStack}
                options={{
                    title: 'View Data',
                    headerShown: false,
                    tabBarIcon: ({size}) => (
                        <IconE
                            name='area-graph'
                            color='#8d67a8'
                            size={30}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    </NavigationContainer>
)

export default TabNavigator;