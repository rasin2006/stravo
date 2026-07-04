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
  ScrollView,
} from 'react-native';
import { register } from '../../services/authService';
import { setToken } from '../../services/tokenStore';
import { Button } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { isValidIdentifier } from '../../utils/authIdentifier';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!isValidIdentifier(identifier)) {
      Alert.alert('Invalid input', 'Enter a valid email or phone number.');
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name, identifier, password });
      setToken(data.token);
      navigation.navigate('Main');
    } catch (err) {
      Alert.alert('Registration failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the trail discovery community</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
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
        <Button title="Register" onPress={handleRegister} loading={loading} disabled={loading} />
        <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    justifyContent: 'center',
  },
  title: { ...typography.hero, marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center', marginBottom: spacing.xxl },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.foreground,
  },
  linkWrap: { alignItems: 'center', marginTop: spacing.lg, minHeight: 44, justifyContent: 'center' },
  link: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
