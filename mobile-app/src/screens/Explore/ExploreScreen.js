import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Polyline } from 'react-native-maps';
import { listSegments, submitSegmentFeedback } from '../../services/activityService';
import { startUserLocationWatch, stopUserLocationWatch, subscribeToUserLocation } from '../../services/gpsService';
import {
  BottomSheet,
  StatChip,
  CambodiaMapView,
  BinaryRatingButtons,
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import {
  segmentToCoords,
  getSegmentScoreColor,
  formatDistance,
  regionFromCoords,
} from '../../utils/mapUtils';

export default function ExploreScreen() {
  const mapRef = useRef(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    loadSegments();
    startUserLocationWatch().then(setLocationReady);
    const unsubLocation = subscribeToUserLocation(setUserCoords);
    return () => {
      stopUserLocationWatch();
      unsubLocation();
    };
  }, []);

  async function loadSegments() {
    setLoading(true);
    try {
      const data = await listSegments();
      setSegments(data);
    } catch {
      setSegments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(isInteresting) {
    if (!selected) return;
    setSubmitting(true);
    try {
      await submitSegmentFeedback(selected.id, isInteresting);
      Alert.alert('Thanks!', 'Your feedback helps others discover great trails.');
      setSelected(null);
      loadSegments();
    } catch (err) {
      Alert.alert('Feedback failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const allCoords = segments.flatMap((s) => segmentToCoords(s));
  const initialRegion = regionFromCoords(allCoords);

  return (
    <View style={styles.container}>
      <CambodiaMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        mapType="terrain"
        showsUserLocation={locationReady}
        showsMyLocationButton={false}
        followsUserLocation={false}
      >
        {segments.map((segment) => {
          const coords = segmentToCoords(segment);
          if (coords.length < 2) return null;
          return (
            <Polyline
              key={segment.id}
              coordinates={coords}
              strokeColor={getSegmentScoreColor(segment, colors)}
              strokeWidth={selected?.id === segment.id ? 6 : 4}
              tappable
              onPress={() => setSelected(segment)}
            />
          );
        })}
      </CambodiaMapView>

      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        {loading && <ActivityIndicator color={colors.primary} />}
        {locationReady && (
          <TouchableOpacity
            style={styles.locateBtn}
            onPress={() => {
              if (userCoords && mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: userCoords.latitude,
                    longitude: userCoords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  },
                  400
                );
              }
            }}
          >
            <StatChip value="● You" />
          </TouchableOpacity>
        )}
      </View>

      {!loading && segments.length === 0 && (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyText}>No segments yet. Record a path to get started.</Text>
        </View>
      )}

      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <Text style={styles.sheetTitle}>Trail Segment</Text>
            <Text style={styles.sheetId}>{selected.id.slice(0, 8)}…</Text>
            <View style={styles.statsRow}>
              <StatChip label="Length" value={formatDistance(selected.lengthMeters)} />
              {selected.scorePercent != null ? (
                <StatChip label="Score" value={`${selected.scorePercent}% interesting`} />
              ) : (
                <StatChip label="Score" value="Unrated" />
              )}
              {selected.feedbackCount > 0 && (
                <StatChip label="Ratings" value={`${selected.feedbackCount}`} />
              )}
            </View>
            <Text style={styles.feedbackPrompt}>Was this segment interesting?</Text>
            <BinaryRatingButtons
              onPositive={() => handleFeedback(true)}
              onNegative={() => handleFeedback(false)}
              loading={submitting}
              disabled={submitting}
            />
          </>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 48,
    left: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  title: { ...typography.h2 },
  emptyBanner: {
    position: 'absolute',
    bottom: 100,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { ...typography.body, textAlign: 'center' },
  sheetTitle: { ...typography.h2, marginBottom: spacing.xs },
  sheetId: { ...typography.caption, marginBottom: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  feedbackPrompt: { ...typography.label, marginBottom: spacing.md },
  locateBtn: { marginLeft: spacing.sm },
});
