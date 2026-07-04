const sequelize = require('../config/database');
const { Activity, ActivityPoint } = require('../models');
const { calculateDistance } = require('./activityService');
const { splitAndCreateSegments } = require('./segmentService');
const { isPostgres } = require('../config/dbTypes');

function normalizePoint(point) {
  return {
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
    timestamp: point.timestamp ? new Date(point.timestamp) : new Date(),
    elevation: point.elevation ?? point.altitude ?? null,
    accuracy: point.accuracy ?? null,
  };
}

exports.createActivityFromPoints = async (userId, title, rawPoints) => {
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
  const startLocation = isPostgres
    ? { type: 'Point', coordinates: [firstPoint.longitude, firstPoint.latitude] }
    : `${firstPoint.latitude},${firstPoint.longitude}`;

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

    return Activity.findByPk(activity.id, {
      include: [
        { model: ActivityPoint, as: 'points' },
        { model: require('../models/ActivitySegment'), as: 'activitySegments' },
      ],
      transaction,
    });
  });
};
