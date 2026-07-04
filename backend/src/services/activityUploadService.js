const sequelize = require('../config/database');
const { Activity, ActivityPoint, SegmentFeedback } = require('../models');
const { calculateDistance } = require('./activityService');
const { splitAndCreateSegments } = require('./segmentService');
const { STOP_RADIUS_METERS } = require('./segmentDetection');
const haversine = require('../utils/haversine');

function normalizePoint(point) {
  return {
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
    timestamp: point.timestamp ? new Date(point.timestamp) : new Date(),
    elevation: point.elevation ?? point.altitude ?? null,
    accuracy: point.accuracy ?? null,
  };
}

function segmentCentroid(segment) {
  const coords = segment.segmentPath?.coordinates || [];
  if (!coords.length) return null;
  const latitude = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
  const longitude = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
  return { latitude, longitude };
}

async function applyPlaceFeedback(userId, segments, placeFeedback, transaction) {
  if (!Array.isArray(placeFeedback) || placeFeedback.length === 0) return;

  for (const entry of placeFeedback) {
    if (entry.isInteresting == null) continue;

    const target = {
      latitude: Number(entry.latitude),
      longitude: Number(entry.longitude),
    };

    const match = segments.find((segment) => {
      const centroid = segmentCentroid(segment);
      return centroid && haversine(centroid, target) <= STOP_RADIUS_METERS;
    });

    if (!match) continue;

    await SegmentFeedback.findOrCreate({
      where: {
        userId,
        activitySegmentId: match.id,
      },
      defaults: {
        isInteresting: Boolean(entry.isInteresting),
        comment: null,
      },
    });
  }
}

exports.createActivityFromPoints = async (userId, title, rawPoints, placeFeedback = []) => {
  if (!title || !Array.isArray(rawPoints) || rawPoints.length < 2) {
    throw new Error('Title and at least two GPS points are required');
  }

  const points = rawPoints.map(normalizePoint);
  const distanceMeters = calculateDistance(points);
  const durationSeconds = Math.max(
    0,
    Math.round(
      (points[points.length - 1].timestamp - points[0].timestamp) / 1000
    )
  );

  const firstPoint = points[0];
  const startLocation = `${firstPoint.latitude},${firstPoint.longitude}`;

  return sequelize.transaction(async (transaction) => {
    const activity = await Activity.create(
      {
        userId,
        title,
        distanceMeters,
        durationSeconds,
        startLocation,
      },
      { transaction }
    );

    await ActivityPoint.bulkCreate(
      points.map((point) => ({
        activityId: activity.id,
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: point.timestamp,
        elevation: point.elevation,
        accuracy: point.accuracy,
      })),
      { transaction }
    );

    const savedPoints = await ActivityPoint.findAll({
      where: { activityId: activity.id },
      order: [['id', 'ASC']],
      transaction,
    });

    const segments = await splitAndCreateSegments(
      activity.id,
      savedPoints.map((point) => ({
        ...point.toJSON(),
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
      })),
      transaction
    );

    await applyPlaceFeedback(userId, segments, placeFeedback, transaction);

    return Activity.findByPk(activity.id, {
      include: [
        { model: ActivityPoint, as: 'points' },
        { model: require('../models/ActivitySegment'), as: 'activitySegments' },
      ],
      transaction,
    });
  });
};
