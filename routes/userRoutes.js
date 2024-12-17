const express = require('express');
const { getUsers, getUserById, getRoles, getUserStatus, updateUserRole } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-users', authenticateToken, getUsers);
router.get('/get-user-info', authenticateToken, getUserById);
router.get('/get-user-status', authenticateToken, getUserStatus);
router.get('/get-roles', authenticateToken, getRoles);
router.put('/update-user-role', authenticateToken, updateUserRole);

module.exports = router;