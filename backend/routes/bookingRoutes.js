const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, adminOrStationMaster } = require('../middlewares/authMiddleware');

router.post('/', protect, bookingController.createBooking);
router.get('/my', protect, bookingController.getUserBookings);
router.get('/', protect, bookingController.getAllBookings);
router.get('/fare/calculate', bookingController.calculateFare)
router.get('/available-seats', protect, bookingController.getAvailableSeats);
router.put('/status', protect, bookingController.updtateStatus);



module.exports = router; 