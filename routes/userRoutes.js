const express = require('express');
const { getUsers, getUserById, getRoles, getUserStatus, updateUserRole, addVehicle,updateLocation} = require('../controllers/userController');
const { sendNotificationToUser } = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
router.post('/add-vehicle', authenticateToken, addVehicle);
router.post('/send-notification', authenticateToken, sendNotificationToUser);
router.put('/update-user-role', authenticateToken, updateUserRole);
router.put('/update-location', authenticateToken, updateLocation);
router.get('/get-users', authenticateToken, getUsers);
router.get('/get-user-info', authenticateToken, getUserById);
router.get('/get-user-status', authenticateToken, getUserStatus);
router.get('/get-roles', authenticateToken, getRoles);



module.exports = router;