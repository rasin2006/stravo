const { ActivitySegment } = require('../models');
const { calculateDistance } = require('./activityService');
const { extractMovingSegments, extractStopPlaces } = require('./segmentDetection');

async function createSegmentFromPoints(activityId, chunkPoints, transaction) {
  const startPoint = chunkPoints[0];
  const endPoint = chunkPoints[chunkPoints.length - 1];
  const durationSeconds = Math.round(
    (new Date(endPoint.timestamp) - new Date(startPoint.timestamp)) / 1000
  );

  return ActivitySegment.create(
    {
      activityId,
      startPointId: startPoint.id,
      endPointId: endPoint.id,
      lengthMeters: calculateDistance(chunkPoints),
      durationSeconds: Math.max(durationSeconds, 0),
      segmentPath: {
        type: 'LineString',
        coordinates: chunkPoints.map((p) => [p.longitude, p.latitude]),
      },
    },
    { transaction }
  );
}

exports.splitAndCreateSegments = async (activityId, points, transaction) => {
  if (points.length < 2) return [];

  const movementSegments = extractMovingSegments(points);
  const stopPlaces = extractStopPlaces(points);
  const segments = [];

  for (const chunkPoints of movementSegments) {
    segments.push(await createSegmentFromPoints(activityId, chunkPoints, transaction));
  }

  for (const chunkPoints of stopPlaces) {
    if (chunkPoints.length === 0) continue;
    segments.push(await createSegmentFromPoints(activityId, chunkPoints, transaction));
  }

  return segments;
};
