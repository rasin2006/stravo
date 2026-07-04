import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { listActivities } from '../../services/activityService';
import { Button, Card } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatDistance, formatDuration } from '../../utils/mapUtils';

export default function ActivityListScreen({ navigation, tabNavigation }) {
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadActivities() {
    setRefreshing(true);
    try {
      const data = await listActivities();
      setActivities(data);
    } catch {
      setActivities([]);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  function goToRecord() {
    tabNavigation?.navigate('Record');
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Activities</Text>
        <Button title="Record new trail" onPress={goToRecord} variant="accent" />
      </View>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadActivities} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>No activities yet.</Text>
            <Text style={styles.emptyHint}>
              Open the Record tab to walk a trail and upload it for the community.
            </Text>
            <Button title="Start recording" onPress={goToRecord} style={styles.emptyButton} />
          </View>
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => navigation.navigate('PathDetail', { activityId: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{formatDistance(item.distanceMeters)}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.meta}>{formatDuration(item.durationSeconds)}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  header: { ...typography.h1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  emptyWrap: { marginTop: spacing.xxxl, gap: spacing.md, alignItems: 'center' },
  empty: { ...typography.body, textAlign: 'center', fontWeight: '600' },
  emptyHint: { ...typography.body, textAlign: 'center', color: colors.muted },
  emptyButton: { marginTop: spacing.md, alignSelf: 'stretch' },
  title: { ...typography.label, marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { ...typography.caption },
  metaDot: { ...typography.caption, marginHorizontal: spacing.sm },
});
