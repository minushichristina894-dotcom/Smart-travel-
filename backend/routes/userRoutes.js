const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireVerifiedCustomer } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', authenticate, requireVerifiedCustomer, userController.getProfile);
router.put('/profile', authenticate, requireVerifiedCustomer, upload.single('profile_picture'), userController.updateProfile);

module.exports = router;
