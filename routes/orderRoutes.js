const express = require('express');
const { makeOrder,getMyOrders,getNewTaxiOrders,acceptTaxiOrder,finishTaxiOrder,ratingJourney} = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();


router.post('/make-taxi-order', authenticateToken, makeOrder);
router.post('/add-rating', authenticateToken, ratingJourney);
router.put('/accept-taxi-order', authenticateToken, acceptTaxiOrder);
router.put('/complete-journey', authenticateToken, finishTaxiOrder);
router.get('/get-my-orders', authenticateToken, getMyOrders);
router.get('/get-new-taxi-orders', authenticateToken, getNewTaxiOrders);

module.exports = router;