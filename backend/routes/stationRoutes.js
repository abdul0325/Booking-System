const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', stationController.getStations);
router.post('/', protect, adminOnly, stationController.createStation);
router.put('/:id', protect, adminOnly, stationController.updateStation);
router.delete('/:id', protect, adminOnly, stationController.deleteStation);

module.exports = router; 