const { ActivitySegment } = require('../models');
const { calculateDistance } = require('./activityService');
const { extractMovingSegments } = require('./segmentDetection');

exports.splitAndCreateSegments = async (activityId, points, transaction) => {
  if (points.length < 2) return [];

  const movementSegments = extractMovingSegments(points);
  const segments = [];

  for (const chunkPoints of movementSegments) {
    const startPoint = chunkPoints[0];
    const endPoint = chunkPoints[chunkPoints.length - 1];
    const durationSeconds = Math.round(
      (new Date(endPoint.timestamp) - new Date(startPoint.timestamp)) / 1000
    );

    const segment = await ActivitySegment.create(
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

    segments.push(segment);
  }

  return segments;
};
