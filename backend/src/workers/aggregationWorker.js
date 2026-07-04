const { SegmentFeedback, Segment } = require('../models');

async function aggregateSegmentMetrics() {
  const feedback = await SegmentFeedback.findAll();
  // TODO: aggregate metrics per segment and persist summary data
}

module.exports = { aggregateSegmentMetrics };
