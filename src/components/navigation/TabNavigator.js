import React from 'react';
import {Image} from "react-native";
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MonitorDevicesStack from './stacks/MonitorDevicesStack'
import ViewDataStack from './stacks/ViewDataStack';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconFo from 'react-native-vector-icons/Foundation';
import FastImage from "react-native-fast-image";
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <NavigationContainer>
        <Tab.Navigator
            initialRouteName='MonitorTab'
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#dea75b',
                tabBarInactiveTintColor: "#ccc",
                tabBarActiveBackgroundColor: '#131313',
                tabBarInactiveBackgroundColor: '#131313',

                tabBarLabelStyle: {
                    fontSize: 24,
                },
                tabBarStyle: {
                        borderTopWidth: 0,
                        height: 90,
                        backgroundColor: '#131313',
                },
                tabBarIconStyle: {
                    height: 40,
                    width: 40,
                    color: '#dea75b'
                },
                safeAreaInsets: {
                    bottom: 0,
                },
            }}
        >
            <Tab.Screen
                name='MonitorTab'
                component={MonitorDevicesStack}
                options={{
                    title: 'Monitor Devices',
                    headerShown: false,
                    tabBarIcon: ({color, size}) => (
                        <Image
                            resizeMode='stretch'
                            style={{width: size, height: size}}
                            source={require('../../resources/aptitude-logo.png')} />
                    ),
                }}
            />
            <Tab.Screen
                name='ViewDataTab'
                component={ViewDataStack}
                options={{
                    title: 'View Data',
                    headerShown: false,
                    tabBarIcon: () => (
                        <IconFo
                            name="graph-bar"
                            color={'#d2792f'}
                            size={30}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    </NavigationContainer>
)

export default TabNavigator;