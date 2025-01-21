const express = require('express');
const { getUsers, getUserById, getRoles, getUserStatus, updateUserRole, addVehicle} = require('../controllers/userController');
const { sendNotificationToUser } = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-users', authenticateToken, getUsers);
router.get('/get-user-info', authenticateToken, getUserById);
router.get('/get-user-status', authenticateToken, getUserStatus);
router.get('/get-roles', authenticateToken, getRoles);
router.put('/update-user-role', authenticateToken, updateUserRole);
router.post('/add-vehicle', authenticateToken, addVehicle);
router.post('/send-notification', authenticateToken, sendNotificationToUser);

module.exports = router;