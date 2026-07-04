import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Polyline } from 'react-native-maps';
import {
  startRecording,
  stopRecording,
  clearRecording,
  getIsRecording,
  getRecordingDurationSeconds,
  subscribeToPoints,
  startUserLocationWatch,
  stopUserLocationWatch,
  fetchCurrentLocation,
  subscribeToUserLocation,
} from '../../services/gpsService';
import { uploadActivity } from '../../services/activityService';
import { Button, InlineBottomSheet, StatChip, CambodiaMapView, LocateButton } from '../../components';
import { colors, spacing, typography } from '../../theme';
import {
  formatDistance,
  formatDuration,
  pathDistanceMeters,
  regionFromCoords,
  regionFromUserLocation,
} from '../../utils/mapUtils';

export default function MapScreen({ navigation, isFocused }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const hasZoomedToUser = useRef(false);
  const [recording, setRecording] = useState(getIsRecording());
  const [points, setPoints] = useState([]);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('Forest walk');
  const [uploading, setUploading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const displayPoints = pendingUpload || points;

  useEffect(() => {
    const unsubPoints = subscribeToPoints(setPoints);
    const unsubLocation = subscribeToUserLocation(setUserCoords);

    fetchCurrentLocation().then((coords) => {
      if (coords) setLocationReady(true);
    });
    startUserLocationWatch().then(setLocationReady);

    return () => {
      unsubPoints();
      unsubLocation();
      stopUserLocationWatch();
    };
  }, []);

  useEffect(() => {
    if (!isFocused || !userCoords || hasZoomedToUser.current || displayPoints.length > 1) {
      return;
    }
    mapRef.current?.animateToRegion(regionFromUserLocation(userCoords), 600);
    hasZoomedToUser.current = true;
  }, [isFocused, userCoords, displayPoints.length]);

  useEffect(() => {
    if (!recording) return undefined;

    const interval = setInterval(() => {
      setDuration(getRecordingDurationSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    if (displayPoints.length > 1 && mapRef.current && recording) {
      mapRef.current.fitToCoordinates(displayPoints, {
        edgePadding: { top: 120, right: 40, bottom: 260, left: 40 },
        animated: true,
      });
    }
  }, [displayPoints.length, recording]);

  function zoomToUser() {
    if (userCoords && mapRef.current) {
      mapRef.current.animateToRegion(regionFromUserLocation(userCoords), 400);
    }
  }

  async function handleStart() {
    try {
      setPendingUpload(null);
      clearRecording();
      await startRecording();
      setRecording(true);
      setDuration(0);
    } catch (err) {
      Alert.alert('Recording error', err.message);
    }
  }

  async function handleStop() {
    const recorded = await stopRecording();
    setRecording(false);

    if (recorded.length < 2) {
      Alert.alert('Not enough GPS data', 'Walk a little longer before saving.');
      clearRecording();
      setPendingUpload(null);
      return;
    }

    setPendingUpload(recorded);
  }

  async function handleUpload() {
    const toUpload = pendingUpload || points;
    if (!toUpload || toUpload.length < 2) {
      Alert.alert('Nothing to upload', 'Record a trail first.');
      return;
    }

    setUploading(true);
    try {
      const activity = await uploadActivity(title, toUpload);
      Alert.alert(
        'Path uploaded',
        `Saved "${activity.title}" with ${activity.activitySegments?.length || 0} segments (split at 30s pauses).`,
        [{ text: 'View', onPress: () => navigation.navigate('PathDetail', { activityId: activity.id }) }]
      );
      clearRecording();
      setPendingUpload(null);
    } catch (err) {
      Alert.alert('Upload failed', err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDiscard() {
    Alert.alert('Discard recording?', 'Your recorded points will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          clearRecording();
          setPendingUpload(null);
        },
      },
    ]);
  }

  const distance = pathDistanceMeters(displayPoints);
  const initialRegion = userCoords
    ? regionFromUserLocation(userCoords)
    : regionFromCoords(displayPoints);

  const showStartButton = !recording && !pendingUpload;
  const showRecordingControls = recording;
  const showUploadControls = !recording && pendingUpload;

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
        {displayPoints.length > 1 && (
          <Polyline coordinates={displayPoints} strokeColor={colors.route} strokeWidth={4} />
        )}
      </CambodiaMapView>

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        <View>
          <Text style={styles.brand}>Record trail</Text>
          <Text style={styles.subtitle}>
            {recording
              ? 'Walking… pauses of 30s create segment breaks'
              : 'Record a new path for others to explore'}
          </Text>
        </View>
        <View style={styles.topActions}>
          {locationReady && <LocateButton onPress={zoomToUser} />}
          <StatChip
            leading={
              recording ? (
                <Ionicons name="radio-button-on" size={14} color={colors.recording} />
              ) : locationReady ? (
                <Ionicons name="navigate" size={14} color={colors.primary} />
              ) : null
            }
            value={recording ? 'REC' : locationReady ? 'GPS' : 'GPS…'}
            highlight={recording}
          />
        </View>
      </View>

      <View style={styles.bottomArea}>
        <InlineBottomSheet>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Trail name (e.g. Forest walk)"
            placeholderTextColor={colors.muted}
            editable={!recording}
          />
          <View style={styles.statsRow}>
            <StatChip value={formatDistance(distance)} />
            <StatChip value={formatDuration(duration)} />
            {recording && (
              <StatChip
                leading={<Ionicons name="radio-button-on" size={14} color={colors.recording} />}
                value="REC"
                highlight
              />
            )}
            {pendingUpload && <StatChip value="Ready" highlight />}
          </View>

          {showStartButton && (
            <>
              <Text style={styles.hint}>
                Tap below when you start walking. Stop to review, then upload.
              </Text>
              <Button
                title="Start recording trail"
                onPress={handleStart}
                style={styles.primaryAction}
              />
            </>
          )}

          {showRecordingControls && (
            <>
              <Text style={styles.hint}>Tap stop when you finish walking.</Text>
              <Button
                title="Stop recording"
                variant="outline"
                onPress={handleStop}
                style={styles.primaryAction}
              />
            </>
          )}

          {showUploadControls && (
            <>
              <Text style={styles.hint}>
                Review your route on the map, then upload or discard.
              </Text>
              <Button
                title={uploading ? 'Uploading…' : 'Upload trail'}
                onPress={handleUpload}
                disabled={uploading}
                loading={uploading}
                style={styles.primaryAction}
              />
              <Button
                title="Discard"
                variant="outline"
                onPress={handleDiscard}
                disabled={uploading}
                style={styles.secondaryAction}
              />
            </>
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
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  brand: {
    ...typography.h2,
    color: colors.foreground,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxWidth: 240,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.md,
    color: colors.muted,
  },
  primaryAction: {
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
  secondaryAction: {
    alignSelf: 'stretch',
  },
});
