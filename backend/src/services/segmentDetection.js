const haversine = require('../utils/haversine');

/** User must stay within this radius to count as "stopped". */
const STOP_RADIUS_METERS = 15;
/** Minimum time stationary before a stop boundary is created. */
const STOP_DURATION_MS = 30 * 1000;
const MIN_SEGMENT_POINTS = 2;

function parseTimestamp(point) {
  return new Date(point.timestamp).getTime();
}

/**
 * Marks GPS points that belong to a 30s+ stationary cluster.
 */
function markStoppedPoints(points) {
  const stopped = new Array(points.length).fill(false);
  let i = 0;

  while (i < points.length) {
    let j = i;
    while (
      j + 1 < points.length &&
      haversine(points[i], points[j + 1]) <= STOP_RADIUS_METERS
    ) {
      j += 1;
    }

    const duration = parseTimestamp(points[j]) - parseTimestamp(points[i]);
    if (j > i && duration >= STOP_DURATION_MS) {
      for (let k = i; k <= j; k += 1) {
        stopped[k] = true;
      }
    }

    i = j + 1;
  }

  return stopped;
}

/**
 * Splits a trail into movement segments between stop clusters.
 * Each segment is the path walked between pauses; stops auto-connect the route.
 */
function extractMovingSegments(points) {
  if (points.length < MIN_SEGMENT_POINTS) return [];

  const stopped = markStoppedPoints(points);
  const segments = [];
  let start = null;

  for (let i = 0; i < points.length; i += 1) {
    if (!stopped[i]) {
      if (start === null) start = i;
    } else if (start !== null) {
      const slice = points.slice(start, i);
      if (slice.length >= MIN_SEGMENT_POINTS) segments.push(slice);
      start = null;
    }
  }

  if (start !== null) {
    const slice = points.slice(start);
    if (slice.length >= MIN_SEGMENT_POINTS) segments.push(slice);
  }

  if (segments.length === 0) {
    return [points];
  }

  return segments;
}

module.exports = {
  STOP_RADIUS_METERS,
  STOP_DURATION_MS,
  markStoppedPoints,
  extractMovingSegments,
};
