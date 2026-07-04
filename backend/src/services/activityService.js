const haversineDistance = require('../utils/haversine');

exports.calculatePace = (distanceMeters, durationSeconds) => {
  if (!distanceMeters || !durationSeconds) return null;
  return durationSeconds / (distanceMeters / 1000);
};

exports.calculateDistance = (points) => {
  return points.reduce((total, point, index) => {
    if (index === 0) return 0;
    const prev = points[index - 1];
    return total + haversineDistance(prev, point);
  }, 0);
};
