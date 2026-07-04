const { Activity, ActivityPoint, ActivitySegment } = require('../models');
const { createActivityFromPoints } = require('../services/activityUploadService');
const { ValidationError } = require('../utils/errors');

exports.createActivity = async (req, res, next) => {
  try {
    const { title, points, placeFeedback } = req.body;
    const activity = await createActivityFromPoints(req.user.id, title, points, placeFeedback);
    res.status(201).json(activity);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.listActivities = async (req, res, next) => {
  try {
    const activities = await Activity.findAll({ where: { userId: req.user.id } });
    res.json(activities);
  } catch (err) {
    next(err);
  }
};

exports.getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: ActivityPoint, as: 'points' },
        { model: ActivitySegment, as: 'activitySegments' },
      ],
    });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (err) {
    next(err);
  }
};
