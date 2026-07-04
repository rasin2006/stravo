import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import PathDetailScreen from '../screens/Map/PathDetailScreen';
import { colors } from '../theme';

export default createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions: { headerShown: false },
    },
    Register: {
      screen: RegisterScreen,
      navigationOptions: { title: 'Create Account', headerBackTitle: 'Back' },
    },
    Main: {
      screen: TabNavigator,
      navigationOptions: { headerShown: false },
    },
    PathDetail: {
      screen: PathDetailScreen,
      navigationOptions: {
        title: 'Activity Detail',
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
      },
    },
  },
  {
    initialRouteName: 'Login',
    headerMode: 'screen',
  }
);
