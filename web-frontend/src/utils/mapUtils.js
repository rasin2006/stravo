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
