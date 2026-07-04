const { ActivitySegment, SegmentFeedback } = require('../models');

function enrichSegment(segment) {
  const data = segment.toJSON ? segment.toJSON() : segment;
  const feedback = data.feedback || [];
  const interestingCount = feedback.filter((f) => f.isInteresting).length;
  const feedbackCount = feedback.length;
  const scorePercent =
    feedbackCount > 0 ? Math.round((interestingCount / feedbackCount) * 100) : null;

  return {
    ...data,
    feedbackCount,
    interestingCount,
    scorePercent,
  };
}

exports.listSegments = async (req, res, next) => {
  try {
    const segments = await ActivitySegment.findAll({
      include: [{ model: SegmentFeedback, as: 'feedback', attributes: ['isInteresting'] }],
    });
    res.json(segments.map(enrichSegment));
  } catch (err) {
    next(err);
  }
};

exports.getSegment = async (req, res, next) => {
  try {
    const segment = await ActivitySegment.findByPk(req.params.id, {
      include: [{ model: SegmentFeedback, as: 'feedback' }],
    });
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    res.json(enrichSegment(segment));
  } catch (err) {
    next(err);
  }
};
