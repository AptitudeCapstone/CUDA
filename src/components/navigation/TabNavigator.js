import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MonitorDevicesStack from './stacks/MonitorDevicesStack'
import ViewDataStack from './stacks/ViewDataStack';
import IconE from 'react-native-vector-icons/Entypo';
import IconMI from 'react-native-vector-icons/MaterialIcons'
import {backgroundColor, mediumPurple, tabNavigatorStyle} from '../../Styles';
import {AnimatedTabBarNavigator,} from 'react-native-animated-nav-tab-bar'
import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

export const Stack = createStackNavigator();
export const Tab = createBottomTabNavigator();
export const screenOptions = {headerShown: false};

const Tabs = AnimatedTabBarNavigator();

const TabNavigator = () => (
    <NavigationContainer>
        <Tabs.Navigator
            initialRouteName='MonitorTab'
            screenOptions={tabNavigatorStyle}
            tabBarOptions={{
                activeTintColor: mediumPurple,
                inactiveTintColor: mediumPurple,
                activeBackgroundColor: backgroundColor,
                inactiveBackgroundColor: backgroundColor
            }}
            appearance={{
                floating: true,
                activeColors: [mediumPurple, mediumPurple],
                activeTabBackgrounds: [backgroundColor, backgroundColor]
            }}>
            <Tabs.Screen
                name='MonitorTab'
                component={MonitorDevicesStack}
                options={{
                    title: 'Devices',
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => (
                        <IconMI name='device-hub' color={color} size={size}/>
                    ),
                }}
            />
            <Tabs.Screen
                name='ViewDataTab'
                component={ViewDataStack}
                options={{
                    title: 'Records',
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => (
                        <IconE name='area-graph' color={color} size={size}/>
                    ),
                }}
            />
        </Tabs.Navigator>
    </NavigationContainer>
)

export default TabNavigator;