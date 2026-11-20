const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin, requireStaff } = require('../middleware/auth');

router.get('/stats', authenticate, requireAdmin, adminController.getAdminStats);
router.get('/staff-stats', authenticate, requireStaff, adminController.getStaffStats);
router.get('/customers', authenticate, requireStaff, adminController.getCustomersForStaff);
router.get('/users', authenticate, requireAdmin, adminController.getCustomers);
router.delete('/users/:id', authenticate, requireAdmin, adminController.deleteCustomer);
router.get('/staff', authenticate, requireAdmin, adminController.getStaff);
router.post('/staff', authenticate, requireAdmin, adminController.createStaff);
router.put('/staff/:id', authenticate, requireAdmin, adminController.updateStaff);
router.get('/settings', authenticate, requireAdmin, adminController.getSettings);
router.put('/settings', authenticate, requireAdmin, adminController.updateSetting);

module.exports = router;
