import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapScreen from '../screens/Map/MapScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import ActivityListScreen from '../screens/ActivityList/ActivityListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { TabBarIcon } from '../components';
import { subscribeToRecordingState } from '../services/gpsService';
import { colors, spacing } from '../theme';

const TABS = [
  { key: 'Record', label: 'Record' },
  { key: 'Explore', label: 'Explore' },
  { key: 'Activities', label: 'My trails' },
  { key: 'Profile', label: 'Profile' },
];

const SCREEN_MAP = {
  Record: MapScreen,
  Explore: ExploreScreen,
  Activities: ActivityListScreen,
  Profile: ProfileScreen,
};

export default function TabNavigator({ navigation }) {
  const [activeTab, setActiveTab] = useState('Record');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => subscribeToRecordingState(setIsRecording), []);

  const screenProps = { navigation, tabNavigation: { navigate: setActiveTab } };

  return (
    <View style={styles.container}>
      {isRecording && activeTab !== 'Record' && (
        <TouchableOpacity
          style={styles.recordingBanner}
          onPress={() => setActiveTab('Record')}
          activeOpacity={0.8}
        >
          <Text style={styles.recordingBannerText}>Recording in progress — tap to return</Text>
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        {TABS.map((tab) => {
          const Screen = SCREEN_MAP[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <View
              key={tab.key}
              style={[styles.screenPane, !isActive && styles.screenHidden]}
              pointerEvents={isActive ? 'auto' : 'none'}
            >
              <Screen {...screenProps} isFocused={isActive} />
            </View>
          );
        })}
      </View>
      <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const showRecordingDot = tab.key === 'Record' && isRecording;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <TabBarIcon
                  tabKey={tab.key}
                  active={isActive}
                  showRecordingDot={showRecordingDot}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, position: 'relative' },
  screenPane: { ...StyleSheet.absoluteFillObject },
  screenHidden: { opacity: 0, zIndex: -1 },
  recordingBanner: {
    backgroundColor: colors.recording,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  recordingBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  tabBarSafe: { backgroundColor: colors.surface },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 48,
    minWidth: 48,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
