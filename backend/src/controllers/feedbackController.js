const { ActivitySegment, SegmentFeedback } = require('../models');
const { validateFeedbackInput } = require('../utils/validation');

exports.createFeedback = async (req, res, next) => {
  try {
    const { isInteresting, comment } = req.body;

    const validationError = validateFeedbackInput(isInteresting);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const segment = await ActivitySegment.findByPk(req.params.id);
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    const [feedback, created] = await SegmentFeedback.findOrCreate({
      where: {
        userId: req.user.id,
        activitySegmentId: req.params.id,
      },
      defaults: {
        isInteresting,
        comment: comment ?? null,
      },
    });

    if (!created) {
      await feedback.update({
        isInteresting,
        comment: comment ?? feedback.comment,
      });
    }

    res.status(created ? 201 : 200).json({
      ...feedback.toJSON(),
      updated: !created,
    });
  } catch (err) {
    next(err);
  }
};
