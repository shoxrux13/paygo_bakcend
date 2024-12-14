const express = require('express');
const { register, resendVerificationCode, verifyPhoneNumber, login, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/resend', resendVerificationCode);
router.post('/verify', verifyPhoneNumber);
router.post('/login', login);
router.post('/logout', logout);


module.exports = router;
