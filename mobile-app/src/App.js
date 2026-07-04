import React from 'react';
import { createAppContainer } from 'react-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigator from './navigation/MainNavigator';

const AppContainer = createAppContainer(MainNavigator);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContainer />
    </SafeAreaProvider>
  );
}
