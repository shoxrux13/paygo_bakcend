const express = require('express');
const { getUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getUsers);

module.exports = router;