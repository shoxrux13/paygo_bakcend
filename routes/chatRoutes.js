const express = require('express');
const { createChat, joinChat,sendMessage,getMessages} = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require("../config/multerConfig"); // Fayl yuklash konfiguratsiyasi
const router = express.Router();


router.post('/create-chat', authenticateToken, createChat);
router.post('/join-chat', authenticateToken, joinChat);
router.post('/send-message', authenticateToken, sendMessage);
router.get('/get-messages', authenticateToken, getMessages);

module.exports = router;