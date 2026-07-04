import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Polyline } from 'react-native-maps';
import {
  startRecording,
  stopRecording,
  getIsRecording,
  getRecordingDurationSeconds,
  subscribeToPoints,
  startUserLocationWatch,
  stopUserLocationWatch,
} from '../../services/gpsService';
import { uploadActivity } from '../../services/activityService';
import { Button, InlineBottomSheet, StatChip, CambodiaMapView } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatDistance, formatDuration, pathDistanceMeters, regionFromCoords } from '../../utils/mapUtils';

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);
  const [recording, setRecording] = useState(getIsRecording());
  const [points, setPoints] = useState([]);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('Forest walk');
  const [uploading, setUploading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPoints(setPoints);
    startUserLocationWatch().then(setLocationReady);
    return () => {
      unsub();
      stopUserLocationWatch();
    };
  }, []);

  useEffect(() => {
    if (!recording) return undefined;

    const interval = setInterval(() => {
      setDuration(getRecordingDurationSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    if (points.length > 1 && mapRef.current) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
        animated: true,
      });
    }
  }, [points.length]);

  async function handleStart() {
    try {
      await startRecording();
      setRecording(true);
      setDuration(0);
    } catch (err) {
      Alert.alert('Recording error', err.message);
    }
  }

  async function handleStopAndUpload() {
    const recorded = await stopRecording();
    setRecording(false);

    if (recorded.length < 2) {
      Alert.alert('Not enough GPS data', 'Walk a little longer before uploading.');
      return;
    }

    setUploading(true);
    try {
      const activity = await uploadActivity(title, recorded);
      Alert.alert(
        'Path uploaded',
        `Saved "${activity.title}" with ${activity.activitySegments?.length || 0} segments.`,
        [{ text: 'View', onPress: () => navigation.navigate('PathDetail', { activityId: activity.id }) }]
      );
    } catch (err) {
      Alert.alert('Upload failed', err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

  const distance = pathDistanceMeters(points);
  const initialRegion = regionFromCoords(points);

  return (
    <View style={styles.container}>
      <CambodiaMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={locationReady}
        followsUserLocation={recording}
        mapType="terrain"
      >
        {points.length > 1 && (
          <Polyline coordinates={points} strokeColor={colors.route} strokeWidth={4} />
        )}
      </CambodiaMapView>

      <View style={styles.topBar}>
        <Text style={styles.brand}>Stravo</Text>
        <StatChip
          value={recording ? '● REC' : locationReady ? '● GPS' : 'GPS…'}
          highlight={recording}
        />
      </View>

      <View style={styles.bottomArea}>
        <InlineBottomSheet>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Activity title"
            placeholderTextColor={colors.muted}
          />
          <View style={styles.statsRow}>
            <StatChip value={formatDistance(distance)} />
            <StatChip value={formatDuration(duration)} />
            {recording && <StatChip value="● REC" highlight />}
          </View>

          {!recording ? (
            <TouchableOpacity style={styles.fab} onPress={handleStart} activeOpacity={0.85}>
              <View style={styles.fabInner} />
              <Text style={styles.fabLabel}>RECORD</Text>
            </TouchableOpacity>
          ) : (
            <Button
              title={uploading ? 'Uploading...' : 'Stop & Upload'}
              onPress={handleStopAndUpload}
              disabled={uploading}
              loading={uploading}
              style={styles.stopButton}
            />
          )}
        </InlineBottomSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: 'absolute',
    top: 48,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    ...typography.h2,
    color: colors.foreground,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    overflow: 'hidden',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  titleInput: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.md,
    padding: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  fab: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fabInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 1,
  },
  stopButton: {
    alignSelf: 'stretch',
  },
});
