const MIN_DISTANCE_METERS = 3;
/** ~10 m area — user must stay within this radius to count as stopped. */
const STOP_RADIUS_METERS = 10;
/** Auto-record a place after this long stationary. */
const STOP_DURATION_MS = 30 * 1000;

let watchId = null;
let stopCheckInterval = null;
let isRecording = false;
let points = [];
let places = [];
let recordedStopStarts = new Set();
let startedAt = null;
let listeners = new Set();

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function clusterCentroid(cluster) {
  const latitude = cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length;
  const longitude = cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length;
  return { latitude, longitude };
}

function notify() {
  listeners.forEach((fn) =>
    fn({
      isRecording,
      points: [...points],
      places: [...places],
      startedAt,
    })
  );
}

function detectPlace() {
  if (points.length < 2) return;

  const lastIdx = points.length - 1;
  const anchor = points[lastIdx];
  let startIdx = lastIdx;

  while (startIdx > 0) {
    const prev = points[startIdx - 1];
    if (haversineMeters(anchor, prev) <= STOP_RADIUS_METERS) {
      startIdx -= 1;
    } else {
      break;
    }
  }

  if (recordedStopStarts.has(startIdx)) return;

  const startTime = new Date(points[startIdx].timestamp).getTime();
  const endTime = isRecording ? Date.now() : new Date(anchor.timestamp).getTime();
  if (endTime - startTime < STOP_DURATION_MS) return;

  const cluster = points.slice(startIdx, lastIdx + 1);
  const { latitude, longitude } = clusterCentroid(cluster);

  recordedStopStarts.add(startIdx);
  places.push({
    id: `place-${startIdx}-${Date.now()}`,
    latitude,
    longitude,
    startedAt: points[startIdx].timestamp,
    recordedAt: new Date(endTime).toISOString(),
    isInteresting: null,
  });
  notify();
}

function clearStopCheckInterval() {
  if (stopCheckInterval != null) {
    clearInterval(stopCheckInterval);
    stopCheckInterval = null;
  }
}

export function subscribeRecording(callback) {
  listeners.add(callback);
  callback({ isRecording, points: [...points], places: [...places], startedAt });
  return () => listeners.delete(callback);
}

export function getRecordingState() {
  return { isRecording, points: [...points], places: [...places], startedAt };
}

export function getPendingPlace() {
  return places.find((p) => p.isInteresting === null) ?? null;
}

export function ratePlace(placeId, isInteresting) {
  const place = places.find((p) => p.id === placeId);
  if (!place) return;
  place.isInteresting = isInteresting;
  notify();
}

export function getPlaceFeedback() {
  return places
    .filter((p) => p.isInteresting !== null)
    .map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      isInteresting: p.isInteresting,
    }));
}

function appendPoint(pos) {
  const next = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    elevation: pos.coords.altitude ?? null,
    accuracy: pos.coords.accuracy ?? null,
    timestamp: new Date(pos.timestamp || Date.now()).toISOString(),
  };

  const last = points[points.length - 1];
  if (last) {
    const dist = haversineMeters(last, next);
    if (dist < MIN_DISTANCE_METERS) return;
  }

  points.push(next);
  detectPlace();
  notify();
}

export function startRecording(onError) {
  if (isRecording) return Promise.resolve(true);

  if (!navigator.geolocation) {
    onError?.('Geolocation is not supported in this browser');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    watchId = navigator.geolocation.watchPosition(
      (pos) => appendPoint(pos),
      (err) => onError?.(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    isRecording = true;
    points = [];
    places = [];
    recordedStopStarts = new Set();
    startedAt = Date.now();
    clearStopCheckInterval();
    stopCheckInterval = setInterval(detectPlace, 5000);
    notify();
    resolve(true);
  });
}

export function stopRecording() {
  if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  clearStopCheckInterval();
  detectPlace();
  isRecording = false;
  const snapshot = [...points];
  notify();
  return snapshot;
}

export function clearRecording() {
  if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  clearStopCheckInterval();
  isRecording = false;
  points = [];
  places = [];
  recordedStopStarts = new Set();
  startedAt = null;
  notify();
}

export function getRecordingDurationSeconds() {
  if (!startedAt) return 0;
  return Math.round((Date.now() - startedAt) / 1000);
}
