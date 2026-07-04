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
let startedAt = null;
let listeners = new Set();
let lastKnownPosition = null;
let stopAnchor = null;
let lastRecordedStopAt = null;

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

function stopRadiusFor(position) {
  const accuracy = position.accuracy ?? 15;
  return Math.max(STOP_RADIUS_METERS, Math.min(accuracy, 30));
}

function getStopProgress() {
  if (!isRecording || !stopAnchor) {
    return { elapsedSeconds: 0, requiredSeconds: STOP_DURATION_MS / 1000, isHolding: false };
  }
  const elapsedMs = Date.now() - stopAnchor.since;
  return {
    elapsedSeconds: Math.min(Math.floor(elapsedMs / 1000), STOP_DURATION_MS / 1000),
    requiredSeconds: STOP_DURATION_MS / 1000,
    isHolding: elapsedMs >= 3000,
  };
}

function alreadyRecordedNear(position) {
  return places.some(
    (place) => haversineMeters(place, position) <= stopRadiusFor(position)
  );
}

function recordPlace(position) {
  if (alreadyRecordedNear(position)) return;

  lastRecordedStopAt = {
    latitude: position.latitude,
    longitude: position.longitude,
  };

  places.push({
    id: `place-${Date.now()}-${places.length}`,
    latitude: position.latitude,
    longitude: position.longitude,
    startedAt: new Date(stopAnchor.since).toISOString(),
    recordedAt: new Date().toISOString(),
    isInteresting: null,
  });
}

function updateStopTracking(position) {
  if (!isRecording) return;

  const radius = stopRadiusFor(position);

  if (!stopAnchor) {
    stopAnchor = {
      latitude: position.latitude,
      longitude: position.longitude,
      since: Date.now(),
    };
    return;
  }

  const moved = haversineMeters(stopAnchor, position) > radius;
  if (moved) {
    stopAnchor = {
      latitude: position.latitude,
      longitude: position.longitude,
      since: Date.now(),
    };
    return;
  }

  const elapsed = Date.now() - stopAnchor.since;
  if (elapsed < STOP_DURATION_MS) return;

  if (
    lastRecordedStopAt &&
    haversineMeters(lastRecordedStopAt, position) <= radius
  ) {
    return;
  }

  recordPlace(position);
}

function notify() {
  listeners.forEach((fn) =>
    fn({
      isRecording,
      points: [...points],
      places: places.map((place) => ({ ...place })),
      startedAt,
      stopProgress: getStopProgress(),
    })
  );
}

export function subscribeRecording(callback) {
  listeners.add(callback);
  callback({
    isRecording,
    points: [...points],
    places: places.map((place) => ({ ...place })),
    startedAt,
    stopProgress: getStopProgress(),
  });
  return () => listeners.delete(callback);
}

export function getRecordingState() {
  return {
    isRecording,
    points: [...points],
    places: places.map((place) => ({ ...place })),
    startedAt,
    stopProgress: getStopProgress(),
  };
}

export function getPendingPlace() {
  return places.find((p) => p.isInteresting === null) ?? null;
}

export function ratePlace(placeId, isInteresting) {
  const idx = places.findIndex((p) => p.id === placeId);
  if (idx === -1) return;
  places[idx] = { ...places[idx], isInteresting };
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

function ingestPosition(pos) {
  const next = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    elevation: pos.coords.altitude ?? null,
    accuracy: pos.coords.accuracy ?? null,
    timestamp: new Date(pos.timestamp || Date.now()).toISOString(),
  };

  lastKnownPosition = next;
  updateStopTracking(next);

  const last = points[points.length - 1];
  if (last) {
    const dist = haversineMeters(last, next);
    if (dist < MIN_DISTANCE_METERS) {
      notify();
      return;
    }
  }

  points.push(next);
  notify();
}

function tickStopCheck() {
  if (!isRecording || !lastKnownPosition) return;
  updateStopTracking(lastKnownPosition);
  notify();
}

function clearStopCheckInterval() {
  if (stopCheckInterval != null) {
    clearInterval(stopCheckInterval);
    stopCheckInterval = null;
  }
}

export function startRecording(onError) {
  if (isRecording) return Promise.resolve(true);

  if (!navigator.geolocation) {
    onError?.('Geolocation is not supported in this browser');
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    watchId = navigator.geolocation.watchPosition(
      (pos) => ingestPosition(pos),
      (err) => onError?.(err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    isRecording = true;
    points = [];
    places = [];
    lastKnownPosition = null;
    stopAnchor = null;
    lastRecordedStopAt = null;
    startedAt = Date.now();
    clearStopCheckInterval();
    stopCheckInterval = setInterval(tickStopCheck, 1000);
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
  if (lastKnownPosition) updateStopTracking(lastKnownPosition);
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
  lastKnownPosition = null;
  stopAnchor = null;
  lastRecordedStopAt = null;
  startedAt = null;
  notify();
}

export function getRecordingDurationSeconds() {
  if (!startedAt) return 0;
  return Math.round((Date.now() - startedAt) / 1000);
}
