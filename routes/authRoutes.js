const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Foydalanuvchi autentifikatsiyasi
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Foydalanuvchini ro'yxatdan o'tkazish
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Foydalanuvchi ismi
 *               email:
 *                 type: string
 *                 description: Foydalanuvchi email manzili
 *               password:
 *                 type: string
 *                 description: Foydalanuvchi paroli
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli yaratildi
 *       400:
 *         description: Xato so'rov
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Foydalanuvchini tizimga kiritish
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Foydalanuvchi email manzili
 *               password:
 *                 type: string
 *                 description: Foydalanuvchi paroli
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli autentifikatsiya
 *       401:
 *         description: Noto'g'ri parol yoki email
 */
router.post('/login', login);

module.exports = router;
