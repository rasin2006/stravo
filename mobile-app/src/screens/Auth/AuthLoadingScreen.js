import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { loadToken } from '../../services/tokenStore';
import { colors } from '../../theme';

export default function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    loadToken().then((token) => {
      navigation.navigate(token ? 'Main' : 'Login');
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
