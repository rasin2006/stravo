import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Polyline } from 'react-native-maps';
import { getActivity } from '../../services/activityService';
import { Card, StatChip, CambodiaMapView } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatDistance, formatDuration, regionFromCoords } from '../../utils/mapUtils';

export default function PathDetailScreen({ navigation }) {
  const activityId = navigation.getParam('activityId');
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getActivity(activityId);
        setActivity(data);
      } catch {
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activityId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Activity not found.</Text>
      </View>
    );
  }

  const coords = (activity.points || []).map((p) => ({
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
  }));

  return (
    <View style={styles.container}>
      <CambodiaMapView style={styles.map} initialRegion={regionFromCoords(coords)} mapType="terrain">
        {coords.length > 1 && (
          <Polyline coordinates={coords} strokeColor={colors.route} strokeWidth={4} />
        )}
      </CambodiaMapView>
      <View style={styles.sheet}>
        <Card style={styles.card}>
          <Text style={styles.title}>{activity.title}</Text>
          <View style={styles.statsRow}>
            <StatChip value={formatDistance(activity.distanceMeters)} />
            <StatChip value={formatDuration(activity.durationSeconds)} />
            <StatChip value={`${activity.activitySegments?.length || 0} segments`} />
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  map: { flex: 1 },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  card: { marginBottom: 0 },
  title: { ...typography.h2, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
