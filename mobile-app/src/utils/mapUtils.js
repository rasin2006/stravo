import { CAMBODIA_DEFAULT_REGION, clampToCambodia } from '../config/cambodia';
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

  return coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

export function getSegmentScoreColor(segment, colors) {
  const score = segment.scorePercent;
  if (score == null) return colors.scoreMid;
  if (score >= 60) return colors.scoreHigh;
  if (score < 40) return colors.scoreLow;
  return colors.scoreMid;
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

export function haversineDistance(a, b) {
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

export function regionFromCoords(coords, padding = 0.01) {
  if (!coords.length) {
    return { ...CAMBODIA_DEFAULT_REGION };
  }

  let minLat = coords[0].latitude;
  let maxLat = coords[0].latitude;
  let minLng = coords[0].longitude;
  let maxLng = coords[0].longitude;

  coords.forEach((c) => {
    minLat = Math.min(minLat, c.latitude);
    maxLat = Math.max(maxLat, c.latitude);
    minLng = Math.min(minLng, c.longitude);
    maxLng = Math.max(maxLng, c.longitude);
  });

  const latDelta = Math.max(maxLat - minLat + padding, 0.01);
  const lngDelta = Math.max(maxLng - minLng + padding, 0.01);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/** Tight zoom centered on the user (~400 m view). */
export function regionFromUserLocation(coords, delta = 0.004) {
  return clampToCambodia({
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  });
}
