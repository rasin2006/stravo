import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../theme';

export default function BinaryRatingButtons({
  onPositive,
  onNegative,
  disabled = false,
  loading = false,
  positiveLabel = 'Interesting',
  negativeLabel = 'Not interesting',
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, styles.positive, (disabled || loading) && styles.disabled]}
        onPress={onPositive}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <Text style={styles.icon}>+</Text>
            <Text style={styles.positiveText}>{positiveLabel}</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.negative, disabled && styles.disabled]}
        onPress={onNegative}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        <Text style={styles.iconNegative}>−</Text>
        <Text style={styles.negativeText}>{negativeLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  positive: {
    backgroundColor: colors.primary,
  },
  negative: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.destructive,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onPrimary,
    lineHeight: 24,
  },
  iconNegative: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.destructive,
    lineHeight: 24,
  },
  positiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  negativeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.destructive,
    marginTop: 2,
    textAlign: 'center',
  },
});
