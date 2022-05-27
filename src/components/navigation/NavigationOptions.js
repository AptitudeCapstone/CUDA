import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

export const Stack = createStackNavigator();
export const Tab = createBottomTabNavigator();
export const screenOptions = {headerShown: false};
export const userScreenOptions = {
    title: '',
    headerStyle: {
        backgroundColor: '#fff',
    },
    headerTintColor: '#222',
    headerTitleStyle: {
        fontWeight: 'bold',
    },
};