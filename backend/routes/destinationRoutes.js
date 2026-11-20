const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', destinationController.getAllDestinations);
router.get('/:id', destinationController.getDestinationById);
router.post('/', authenticate, requireAdmin, destinationController.createDestination);
router.put('/:id', authenticate, requireAdmin, destinationController.updateDestination);
router.delete('/:id', authenticate, requireAdmin, destinationController.deleteDestination);

module.exports = router;
