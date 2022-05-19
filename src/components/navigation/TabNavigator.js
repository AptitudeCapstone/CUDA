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

const TabNavigator = () => (
    <NavigationContainer>
        <Tab.Navigator
            initialRouteName='MonitorTab'
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#eee',
                tabBarInactiveTintColor: '#ccc',
                tabBarActiveBackgroundColor: '#131313',
                tabBarInactiveBackgroundColor: '#131313',

                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: 'bold'
                },
                tabBarStyle: {
                        borderTopWidth: 0,
                        height: 100,
                        padding: 10,
                        backgroundColor: '#131313',
                },
                tabBarIconStyle: {
                    height: 40,
                    width: 40,
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
                    title: 'Devices',
                    headerShown: false,
                    tabBarIcon: ({size}) => (
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
                    tabBarIcon: ({size}) => (
                        <IconE
                            name='area-graph'
                            color='#8c5fed'
                            style={{width: size, height: size}}
                            size={size}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    </NavigationContainer>
)

export default TabNavigator;