import React from 'react';
import {Image} from "react-native";
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MonitorDevicesStack from './stacks/MonitorDevicesStack'
import ViewDataStack from './stacks/ViewDataStack';
import IconE from 'react-native-vector-icons/Entypo';
import {tabNavigatorStyle} from '../../Styles';
import {
    AnimatedTabBarNavigator,
    DotSize,
    TabElementDisplayOptions,
    TabButtonLayout,
    IAppearanceOptions
} from 'react-native-animated-nav-tab-bar'

const Tabs = AnimatedTabBarNavigator();

const TabNavigator = () => (
    <NavigationContainer>
        <Tabs.Navigator initialRouteName='MonitorTab' screenOptions={tabNavigatorStyle}>
            <Tabs.Screen
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
            <Tabs.Screen
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
        </Tabs.Navigator>
    </NavigationContainer>
)

export default TabNavigator;