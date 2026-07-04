import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../theme';

const VARIANTS = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.onPrimary },
  },
  accent: {
    container: { backgroundColor: colors.accent },
    text: { color: colors.foreground },
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    text: { color: colors.onPrimary },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    text: { color: colors.foreground },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
  destructive: {
    container: { backgroundColor: colors.destructive },
    text: { color: colors.onPrimary },
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        v.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} />
      ) : (
        <Text style={[styles.text, v.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
