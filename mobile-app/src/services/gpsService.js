import * as Location from 'expo-location';

let isRecording = false;
let recordedPoints = [];
let watchSubscription = null;
let recordingStartedAt = null;
let pointListeners = [];
let recordingListeners = [];
let userLocationSubscription = null;
let userLocationListeners = [];
let lastUserLocation = null;

function notifyListeners() {
  const snapshot = [...recordedPoints];
  pointListeners.forEach((fn) => fn(snapshot));
}

function notifyRecordingState() {
  recordingListeners.forEach((fn) => fn(isRecording));
}

function notifyUserLocation(location) {
  lastUserLocation = location;
  userLocationListeners.forEach((fn) => fn(location));
}

export function subscribeToPoints(callback) {
  pointListeners.push(callback);
  callback([...recordedPoints]);
  return () => {
    pointListeners = pointListeners.filter((fn) => fn !== callback);
  };
}

export function subscribeToRecordingState(callback) {
  recordingListeners.push(callback);
  callback(isRecording);
  return () => {
    recordingListeners = recordingListeners.filter((fn) => fn !== callback);
  };
}

export function subscribeToUserLocation(callback) {
  userLocationListeners.push(callback);
  if (lastUserLocation) callback(lastUserLocation);
  return () => {
    userLocationListeners = userLocationListeners.filter((fn) => fn !== callback);
  };
}

export function getLastUserLocation() {
  return lastUserLocation;
}

export async function ensureLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function fetchCurrentLocation() {
  const granted = await ensureLocationPermission();
  if (!granted) return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
    notifyUserLocation(coords);
    return coords;
  } catch {
    return null;
  }
}

export async function startUserLocationWatch() {
  const granted = await ensureLocationPermission();
  if (!granted) return false;

  if (userLocationSubscription) return true;

  userLocationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 3000,
      distanceInterval: 10,
    },
    (location) => {
      notifyUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    }
  );

  return true;
}

export function stopUserLocationWatch() {
  if (userLocationSubscription) {
    userLocationSubscription.remove();
    userLocationSubscription = null;
  }
}

export function getRecordedPoints() {
  return [...recordedPoints];
}

export function getIsRecording() {
  return isRecording;
}

export function clearRecording() {
  recordedPoints = [];
  recordingStartedAt = null;
  notifyListeners();
}

export async function startRecording() {
  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error('Location permission is required to record a path');
  }

  isRecording = true;
  recordedPoints = [];
  recordingStartedAt = Date.now();
  notifyRecordingState();
  notifyListeners();

  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    (location) => {
      recordedPoints.push({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        elevation: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date(location.timestamp || Date.now()).toISOString(),
      });
      notifyListeners();
    }
  );
}

export async function stopRecording() {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
  isRecording = false;
  notifyRecordingState();
  return [...recordedPoints];
}

export function getPointCount() {
  return recordedPoints.length;
}

export function getRecordingDurationSeconds() {
  if (!recordingStartedAt) return 0;
  return Math.round((Date.now() - recordingStartedAt) / 1000);
}
