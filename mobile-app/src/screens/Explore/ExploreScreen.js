import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Polyline } from 'react-native-maps';
import { listSegments, submitSegmentFeedback } from '../../services/activityService';
import { startUserLocationWatch, stopUserLocationWatch, subscribeToUserLocation } from '../../services/gpsService';
import {
  BottomSheet,
  StatChip,
  CambodiaMapView,
  BinaryRatingButtons,
  LocateButton,
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import {
  segmentToCoords,
  getSegmentScoreColor,
  formatDistance,
  regionFromCoords,
  regionFromUserLocation,
} from '../../utils/mapUtils';

export default function ExploreScreen({ isFocused, tabNavigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const hasZoomedToUser = useRef(false);
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

  useEffect(() => {
    if (!isFocused || !userCoords || hasZoomedToUser.current) return;
    mapRef.current?.animateToRegion(regionFromUserLocation(userCoords), 600);
    hasZoomedToUser.current = true;
  }, [isFocused, userCoords]);

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
      const result = await submitSegmentFeedback(selected.id, isInteresting);
      Alert.alert(
        'Thanks!',
        result.updated
          ? 'Your rating was updated.'
          : 'Your feedback helps others discover great trails.'
      );
      setSelected(null);
      loadSegments();
    } catch (err) {
      Alert.alert('Feedback failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const allCoords = segments.flatMap((s) => segmentToCoords(s));
  const initialRegion = userCoords
    ? regionFromUserLocation(userCoords)
    : regionFromCoords(allCoords);

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

      <View style={[styles.header, { top: insets.top + spacing.sm }]}>
        <Text style={styles.title}>Explore</Text>
        {loading && <ActivityIndicator color={colors.primary} />}
        {locationReady && (
          <LocateButton
            onPress={() => {
              if (userCoords && mapRef.current) {
                mapRef.current.animateToRegion(regionFromUserLocation(userCoords), 400);
              }
            }}
          />
        )}
      </View>

      {!loading && segments.length === 0 && (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyText}>No segments yet. Record a path to get started.</Text>
          {tabNavigation && (
            <TouchableOpacity
              style={styles.recordLink}
              onPress={() => tabNavigation.navigate('Record')}
              accessibilityRole="button"
              accessibilityLabel="Go to Record trail"
            >
              <Text style={styles.recordLinkText}>Go to Record trail</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
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
  recordLink: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
  },
  recordLinkText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  sheetTitle: { ...typography.h2, marginBottom: spacing.xs },
  sheetId: { ...typography.caption, marginBottom: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  feedbackPrompt: { ...typography.label, marginBottom: spacing.md },
});
