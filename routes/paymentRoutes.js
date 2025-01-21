const express = require('express');
const { makePayment,paymentStatus,paymentHistory,subscribeTariff} = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/make-payment', authenticateToken, makePayment);
router.post('/subscribe-tariff', authenticateToken, subscribeTariff);
router.get('/payment-status', authenticateToken, paymentStatus);
router.get('/payment-history', authenticateToken, paymentHistory);

module.exports = router;