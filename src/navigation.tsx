import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import FeedScreen from './screens/FeedScreen';

const Stack = createStackNavigator();

export default function Navigation() {
    // For now, we'll start with auth screens
    // Later we'll add logic to check if user is logged in

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#3498db',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ title: 'Sign In' }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ title: 'Create Account' }}
                />
                <Stack.Screen
                    name="Feed"
                    component={FeedScreen}
                    options={{
                        title: 'WarBox Feed',
                        headerBackTitle: 'Logout',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}