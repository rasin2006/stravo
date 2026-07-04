const express = require('express');
const { listSegments, getSegment } = require('../controllers/segmentController');
const { createFeedback } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', listSegments);
router.get('/:id', getSegment);
router.post('/:id/feedback', authMiddleware, createFeedback);

module.exports = router;
