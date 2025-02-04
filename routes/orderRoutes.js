const express = require('express');
const { makeOrder,getMyOrders,getNewTaxiOrders} = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/make-taxi-order', authenticateToken, makeOrder);
router.get('/get-my-orders', authenticateToken, getMyOrders);
router.get('/get-new-taxi-orders', authenticateToken, getNewTaxiOrders);

module.exports = router;