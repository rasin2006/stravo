const express = require('express');
const { listActivities, getActivity, createActivity } = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.get('/', listActivities);
router.post('/', createActivity);
router.get('/:id', getActivity);

module.exports = router;
