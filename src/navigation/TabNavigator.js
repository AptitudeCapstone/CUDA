import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MonitorDevicesStack from './stacks/MonitorDevicesStack'
import ViewDataStack from './stacks/ViewDataStack';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import IconFo from 'react-native-vector-icons/Foundation';
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <NavigationContainer>
        <Tab.Navigator
            initialRouteName='MonitorTab'
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#ccc",
                tabBarActiveBackgroundColor: '#131313',
                tabBarInactiveBackgroundColor: '#131313',
                tabBarStyle: [
                    {
                        borderTopColor: '#555',
                        display: 'flex',
                        backgroundColor: '#131313',
                        paddingBottom: 30,
                        paddingTop: 15
                    }, null
                ],
                paddingTop: 15,
                paddingBottom: 30,
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
                    tabBarIcon: ({color}) => (
                        <IconMI
                            name="device-hub"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name='View Data'
                component={ViewDataStack}
                options={{
                    title: 'View Data',
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <IconFo
                            name="graph-bar"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    </NavigationContainer>
)

export default TabNavigator;