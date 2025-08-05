const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', protect, userController.getProfile);
router.get('/users', protect, userController.getAllUsers)
router.put('/:id/status', protect, userController.updateUserStatus)


module.exports = router; 