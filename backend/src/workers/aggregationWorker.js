const { SegmentFeedback } = require('../models');

async function aggregateSegmentMetrics() {
  await SegmentFeedback.findAll();
  // TODO: aggregate metrics per activity segment and persist summary data
}

module.exports = { aggregateSegmentMetrics };
