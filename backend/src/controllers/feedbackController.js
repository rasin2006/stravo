const { SegmentFeedback } = require('../models');

exports.createFeedback = async (req, res, next) => {
  try {
    const { isInteresting, comment } = req.body;
    const feedback = await SegmentFeedback.create({
      userId: req.user.id,
      activitySegmentId: req.params.id,
      isInteresting,
      comment,
    });
    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
};
