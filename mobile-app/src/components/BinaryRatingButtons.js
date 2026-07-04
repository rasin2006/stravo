import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        accessibilityRole="button"
        accessibilityLabel={positiveLabel}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <Ionicons name="thumbs-up" size={22} color={colors.onPrimary} />
            <Text style={styles.positiveText}>{positiveLabel}</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.negative, disabled && styles.disabled]}
        onPress={onNegative}
        disabled={disabled || loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={negativeLabel}
        accessibilityState={{ disabled }}
      >
        <Ionicons name="thumbs-down" size={22} color={colors.destructive} />
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
    gap: spacing.xs,
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
  positiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onPrimary,
    textAlign: 'center',
  },
  negativeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.destructive,
    textAlign: 'center',
  },
});
