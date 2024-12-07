const express = require('express');
const { register, verifyPhoneNumber, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify', verifyPhoneNumber);
router.post('/login', login);

module.exports = router;
