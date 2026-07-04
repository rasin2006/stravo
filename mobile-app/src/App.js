import React, { useEffect } from 'react';
import { createAppContainer } from 'react-navigation';
import { StackActions, NavigationActions } from 'react-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigator from './navigation/MainNavigator';
import { setUnauthorizedHandler } from './services/authEvents';

const AppContainer = createAppContainer(MainNavigator);

export default function App() {
  const navRef = React.createRef();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (navRef.current) {
        navRef.current.dispatch(
          StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Login' })],
          })
        );
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AppContainer ref={navRef} />
    </SafeAreaProvider>
  );
}
