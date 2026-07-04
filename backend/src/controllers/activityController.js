const { Activity } = require('../models');
const { createActivityFromPoints } = require('../services/activityUploadService');

exports.createActivity = async (req, res, next) => {
  try {
    const { title, points } = req.body;
    const activity = await createActivityFromPoints(req.user.id, title, points);
    res.status(201).json(activity);
  } catch (err) {
    if (err.message.includes('required')) {
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
    const { ActivityPoint, ActivitySegment } = require('../models');
    const activity = await Activity.findByPk(req.params.id, {
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
