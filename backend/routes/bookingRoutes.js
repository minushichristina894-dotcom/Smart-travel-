const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const paymentController = require('../controllers/paymentController');
const { authenticate, requireStaff, requireVerifiedCustomer } = require('../middleware/auth');

router.get('/', authenticate, requireVerifiedCustomer, bookingController.getBookings);
router.get('/upcoming', authenticate, requireVerifiedCustomer, bookingController.getUpcomingBookings);
router.post('/', authenticate, requireVerifiedCustomer, bookingController.createBooking);
router.post('/:id/pay', authenticate, requireVerifiedCustomer, paymentController.processPayment);
router.get('/:id/report', authenticate, requireVerifiedCustomer, paymentController.getTripReport);
router.post('/:id/send-report', authenticate, requireStaff, paymentController.emailTripReport);
router.put('/:id/status', authenticate, requireStaff, bookingController.updateBookingStatus);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
