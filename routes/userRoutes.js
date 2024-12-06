const express = require('express');
const { getUsers } = require('../controllers/userController');
const { getUserById } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-users', authenticateToken, getUsers);
router.get('/get-user-by-id/:id', authenticateToken, getUserById);

module.exports = router;