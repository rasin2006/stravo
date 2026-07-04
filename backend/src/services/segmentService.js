const { ActivitySegment } = require('../models');
const { calculateDistance } = require('./activityService');

const SEGMENT_LENGTH_METERS = 100;

exports.splitAndCreateSegments = async (activityId, points, transaction) => {
  if (points.length < 2) return [];

  const segments = [];
  let chunkStart = 0;
  let chunkDistance = 0;

  for (let i = 1; i < points.length; i += 1) {
    chunkDistance += calculateDistance([points[i - 1], points[i]]);

    const isLastPoint = i === points.length - 1;
    if (chunkDistance >= SEGMENT_LENGTH_METERS || isLastPoint) {
      const chunkPoints = points.slice(chunkStart, i + 1);
      const startPoint = points[chunkStart];
      const endPoint = points[i];
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
      chunkStart = i;
      chunkDistance = 0;
    }
  }

  return segments;
};
