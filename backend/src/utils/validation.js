const MIN_PASSWORD_LENGTH = 8;
const MAX_ACTIVITY_POINTS = 5000;
const MAX_TITLE_LENGTH = 255;

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

function validateCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return 'Invalid latitude';
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return 'Invalid longitude';
  }
  return null;
}

function validateActivityUpload(title, rawPoints) {
  if (typeof title !== 'string' || !title.trim()) {
    return 'Title is required';
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;
  }
  if (!Array.isArray(rawPoints) || rawPoints.length < 2) {
    return 'At least two GPS points are required';
  }
  if (rawPoints.length > MAX_ACTIVITY_POINTS) {
    return `At most ${MAX_ACTIVITY_POINTS} GPS points are allowed per activity`;
  }
  for (let i = 0; i < rawPoints.length; i += 1) {
    const point = rawPoints[i];
    const coordError = validateCoordinates(point?.latitude, point?.longitude);
    if (coordError) {
      return `Point ${i + 1}: ${coordError}`;
    }
  }
  return null;
}

function validateFeedbackInput(isInteresting) {
  if (typeof isInteresting !== 'boolean') {
    return 'isInteresting must be a boolean';
  }
  return null;
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  MAX_ACTIVITY_POINTS,
  validatePassword,
  validateCoordinates,
  validateActivityUpload,
  validateFeedbackInput,
};
