export function segmentToCoords(segment) {
  const path = segment?.segmentPath;
  if (!path) return [];

  let coordinates = path.coordinates;
  if (typeof path === 'string') {
    try {
      const parsed = JSON.parse(path);
      coordinates = parsed.coordinates;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(coordinates)) return [];

  return coordinates.map(([lng, lat]) => [lat, lng]);
}

export function getSegmentScoreColor(segment) {
  const score = segment.scorePercent;
  if (score == null) return '#94A3B8';
  if (score >= 60) return '#2D6A4F';
  if (score < 40) return '#DC2626';
  return '#94A3B8';
}

export function formatDistance(meters) {
  const m = Number(meters) || 0;
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

export function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function haversineDistance(a, b) {
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

export function pathDistanceMeters(points) {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineDistance(points[i - 1], points[i]);
  }
  return total;
}

export function pinsToUploadPoints(pins, secondsBetween = 60) {
  const base = Date.now();
  return pins.map((pin, index) => ({
    latitude: pin.latitude,
    longitude: pin.longitude,
    timestamp: new Date(base + index * secondsBetween * 1000).toISOString(),
    elevation: null,
    accuracy: null,
  }));
}

export function pinPlaceFeedback(pins) {
  return pins
    .filter((pin) => pin.isInteresting !== null)
    .map((pin) => ({
      latitude: pin.latitude,
      longitude: pin.longitude,
      isInteresting: pin.isInteresting,
    }));
}
