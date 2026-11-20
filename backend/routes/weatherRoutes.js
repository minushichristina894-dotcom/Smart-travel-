const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { authenticate, requireStaff, requireVerifiedCustomer } = require('../middleware/auth');

router.get('/places', authenticate, requireVerifiedCustomer, weatherController.searchPlaces);
router.post('/analyze', authenticate, requireVerifiedCustomer, weatherController.analyzeWeather);
router.post('/report-pdf', authenticate, requireVerifiedCustomer, weatherController.downloadWeatherPdf);
router.post('/report-email', authenticate, requireVerifiedCustomer, weatherController.emailWeatherPdf);
router.get('/current/:destinationId', authenticate, requireVerifiedCustomer, weatherController.getCurrentWeather);
router.get('/logs', authenticate, requireStaff, weatherController.getWeatherLogs);

module.exports = router;
