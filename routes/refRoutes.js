const express = require('express');
const { getCarModels, getCarBrands,getRegions,getTarifss, getTimes} = require('../controllers/refController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/get-car-brands', authenticateToken, getCarBrands);
router.get('/get-car-models', authenticateToken, getCarModels);
router.get('/get-regions', authenticateToken, getRegions);
router.get('/get-tariffs', authenticateToken, getTarifss);
router.get('/get-times', authenticateToken, getTimes);

module.exports = router;