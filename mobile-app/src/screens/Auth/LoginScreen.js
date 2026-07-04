import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { login } from '../../services/authService';
import { setToken } from '../../services/tokenStore';
import { Button } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { isValidIdentifier } from '../../utils/authIdentifier';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!isValidIdentifier(identifier)) {
      Alert.alert('Invalid input', 'Enter a valid email or phone number.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ identifier, password });
      await setToken(data.token);
      navigation.navigate('Main');
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <View style={styles.pattern} />
        <Text style={styles.brand}>Stravo</Text>
        <Text style={styles.tagline}>Discover trails others have walked</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email or phone number"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="default"
          autoCorrect={false}
          value={identifier}
          onChangeText={setIdentifier}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Sign In" onPress={handleLogin} loading={loading} disabled={loading} />
        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  brand: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: { ...typography.body, textAlign: 'center' },
  form: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.foreground,
  },
  linkWrap: { alignItems: 'center', marginTop: spacing.lg, minHeight: 44, justifyContent: 'center' },
  link: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
