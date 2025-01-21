const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // User modelini import qiling
const crypto = require('crypto');
const { sendSMS, generateVerificationCode } = require('../utils/authUtils'); // SMS funksiyani import qiling
const { stat } = require('fs');

// Maxfiy kalit
const JWT_SECRET = process.env.JWT_SECRET;


// Foydalanuvchini ro'yxatdan o'tkazish
exports.register = async (req, res) => {
    /*  #swagger.tags = ['Auth']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $name: 'Shoxrux',
                $phone_number: '+998911456070',
            }
    } */
    try {
        const { name } = req.body;
        let { phone_number } = req.body; // `let` bilan e'lon qilish
        phone_number = phone_number.replace(/[^\d+]/g, ''); // Telefon raqamni tozalash

        // Foydalanuvchi mavjudligini tekshirish
        const existingUser = await User.findOne({ where: { phone_number } });

        if (existingUser) {
            // Agar foydalanuvchi mavjud bo'lsa va is_verified false bo'lsa
            if (!existingUser.is_verified) {
                return res.status(200).json({
                    status: 'success',
                    statusCode: 200,
                    message: 'User already exists but not verified. Please verify your account.',
                });
            }
            // Agar foydalanuvchi mavjud bo'lsa va is_verified true bo'lsa
            return res.status(400).json({
                message: 'Phone number already exists.',
            });
        }

        // Tasdiqlash kodini generatsiya qilish
        const verificationCode = generateVerificationCode();

        // Yangi foydalanuvchini bazaga saqlash
        const user = await User.create({
            name,
            phone_number,
            verification_code: verificationCode, // Tasdiqlash kodini saqlash
        });

        // SMS orqali tasdiqlash kodini yuborish
        await sendSMS(phone_number, `Sizning PayGo ilovasi uchun tasdiqlash kodingiz: ${verificationCode}`);

        res.status(201).json({
            status: 'success',
            statusCode: 201,
            message: 'User registered successfully. Verification code sent to phone.',
            user: { id: user.id, phone_number: user.phone_number },
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

};

exports.resendVerificationCode = async (req, res) => {
    /*  #swagger.tags = ['Auth']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $phone_number: '+998911456070',
            }
    } */
    try {
        let { phone_number } = req.body;
        phone_number = phone_number.replace(/[^\d+]/g, ''); // Telefon raqamni tozalash
        // Foydalanuvchini topish
        const user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: 'Phone number already verified' });
        }

        // Tasdiqlash kodini generatsiya qilish
        const verificationCode = generateVerificationCode();

        // Tasdiqlash kodini saqlash
        user.verification_code = verificationCode;
        await user.save();

        // SMS orqali tasdiqlash kodini yuborish
        await sendSMS(phone_number, `Sizning PayGo ilovasi uchun tasdiqlash kodingiz: ${verificationCode}`);

        res.json({ message: 'Verification code sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Telefon raqamni tasdiqlash
exports.verifyPhoneNumber = async (req, res) => {
    /*  #swagger.tags = ['Auth']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $phone_number: '+998911456070',
                $verification_code: '123456',
                $fcm_token: 'FCM token'
            }
    } */
    try {
        const { verification_code,fcm_token } = req.body;
        let { phone_number } = req.body;
        phone_number = phone_number.replace(/[^\d+]/g, ''); // Telefon raqamni tozalash

        

        // Foydalanuvchini topish
        const user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tasdiqlash kodini tekshirish
        if (user.verification_code !== verification_code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Foydalanuvchini tasdiqlangan deb belgilash
        user.is_verified = true;
        user.verification_code = null; // Tasdiqlash kodini o‘chirish
        user.fcm_token = fcm_token; // FCM tokenni saqlash
        await user.save();

        // JWT access token yaratish
        const accessToken = jwt.sign(
            { id: user.id, phone_number: user.phone_number }, // Token ma'lumotlari
            JWT_SECRET, // Maxfiy kalit
            { expiresIn: '3h' } // Access token amal qilish muddati (15 daqiqa)
        );

        // Refresh token yaratish
        const refreshToken = crypto.randomBytes(32).toString('hex');
        user.refresh_token = refreshToken; // Refresh tokenni bazaga saqlash
        await user.save();

        res.json({
            message: 'Phone number verified successfully',
            role_id: user.role_id,
            accessToken, // Access tokenni qaytarish
            refreshToken, // Refresh tokenni qaytarish
            fcm_token: user.fcm_token,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Tizimga kirish
exports.login = async (req, res) => {
    /*  #swagger.tags = ['Auth']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $phone_number: '+998911456070',
            }
    } */
    try {
        let { phone_number } = req.body;
        phone_number = phone_number.replace(/[^\d+]/g, ''); // Telefon raqamni tozalash
        // Foydalanuvchini topish
        const user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tasdiqlash kodini generatsiya qilish
        const verificationCode = generateVerificationCode();

        // Tasdiqlash kodini saqlash
        user.verification_code = verificationCode;
        await user.save();

        // SMS orqali tasdiqlash kodini yuborish
        await sendSMS(phone_number, `Sizning PayGo ilovasi uchun tasdiqlash kodingiz: ${verificationCode}`);

        res.json({ message: 'Verification code sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tokenlarni yangilash
exports.refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        // Refresh tokenni bazadan topish
        const user = await User.findOne({ where: { refresh_token: refreshToken } });

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Yangi access token yaratish
        const accessToken = jwt.sign(
            { id: user.id, phone_number: user.phone_number },
            JWT_SECRET,
            { expiresIn: '3h' } // 15 daqiqa amal qiladi
        );

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Chiqish
exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const user = await User.findOne({ where: { refresh_token: refreshToken } });

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        user.refresh_token = null; // Refresh tokenni o‘chirish
        await user.save();

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


