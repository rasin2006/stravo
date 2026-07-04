import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function StatChip({ label, value, highlight = false }) {
  return (
    <View style={[styles.chip, highlight && styles.highlight]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={[styles.value, highlight && styles.highlightText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  highlight: {
    backgroundColor: '#FEE2E2',
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '600',
  },
  highlightText: {
    color: colors.recording,
  },
});
