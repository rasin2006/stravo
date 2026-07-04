import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const TAB_ICONS = {
  Record: { active: 'radio-button-on', inactive: 'radio-button-off' },
  Explore: { active: 'map', inactive: 'map-outline' },
  Activities: { active: 'list', inactive: 'list-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabBarIcon({ tabKey, active, showRecordingDot = false }) {
  const names = TAB_ICONS[tabKey] || TAB_ICONS.Profile;
  const name = active ? names.active : names.inactive;
  const color = active ? colors.primary : colors.muted;

  return (
    <View style={styles.wrap}>
      <Ionicons name={name} size={22} color={color} />
      {showRecordingDot && (
        <View style={styles.recordingDot} accessibilityLabel="Recording active" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.recording,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
