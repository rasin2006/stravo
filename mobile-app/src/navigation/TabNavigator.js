import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapScreen from '../screens/Map/MapScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import ActivityListScreen from '../screens/ActivityList/ActivityListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { colors, spacing } from '../theme';

const TABS = [
  { key: 'Record', label: 'Record', icon: '◎' },
  { key: 'Explore', label: 'Explore', icon: '⊕' },
  { key: 'Activities', label: 'Activities', icon: '≡' },
  { key: 'Profile', label: 'Profile', icon: '○' },
];

export default function TabNavigator({ navigation }) {
  const [activeTab, setActiveTab] = useState('Record');

  const screenProps = { navigation, tabNavigation: { navigate: setActiveTab } };

  function renderScreen() {
    switch (activeTab) {
      case 'Explore':
        return <ExploreScreen {...screenProps} />;
      case 'Activities':
        return <ActivityListScreen {...screenProps} />;
      case 'Profile':
        return <ProfileScreen {...screenProps} />;
      default:
        return <MapScreen {...screenProps} />;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
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
  content: { flex: 1 },
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
    minHeight: 44,
  },
  tabIcon: {
    fontSize: 18,
    color: colors.muted,
    marginBottom: 2,
  },
  tabIconActive: { color: colors.primary },
  tabLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
