const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', authenticate, requireAdmin, activityController.createActivity);
router.put('/:id', authenticate, requireAdmin, activityController.updateActivity);
router.delete('/:id', authenticate, requireAdmin, activityController.deleteActivity);

module.exports = router;
