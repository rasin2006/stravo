import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { listActivities } from '../../services/activityService';
import { Card } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatDistance, formatDuration } from '../../utils/mapUtils';

export default function ActivityListScreen({ navigation }) {
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadActivities} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No activities yet. Record your first trail!</Text>
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
  header: {
    ...typography.h1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  empty: { ...typography.body, textAlign: 'center', marginTop: spacing.xxxl },
  title: { ...typography.label, marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { ...typography.caption },
  metaDot: { ...typography.caption, marginHorizontal: spacing.sm },
});
