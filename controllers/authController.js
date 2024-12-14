const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // User modelini import qiling
const { sendSMS, generateVerificationCode } = require('../utils/authUtils'); // SMS funksiyani import qiling
const e = require('cors');

// Maxfiy kalit
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';


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
                $password: '12356',
            }
    } */
    try {
        const { name, password } = req.body;
        let { phone_number } = req.body; // `let` bilan e'lon qilish
        phone_number = phone_number.replace(/[^\d+]/g, ''); // Telefon raqamni tozalash

        console.log('phone_number', phone_number);
        // Foydalanuvchi mavjudligini tekshirish
        const existingUser = await User.findOne({ where: { phone_number } });

        if (existingUser) {
            // Agar foydalanuvchi mavjud bo'lsa va is_verified false bo'lsa
            if (!existingUser.is_verified) {
                return res.status(200).json({
                    message: 'User already exists but not verified. Please verify your account.',
                });
            }
            // Agar foydalanuvchi mavjud bo'lsa va is_verified true bo'lsa
            return res.status(400).json({
                message: 'Phone number already exists.',
            });
        }

        // Parolni xeshlash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tasdiqlash kodini generatsiya qilish
        const verificationCode = generateVerificationCode();

        // Yangi foydalanuvchini bazaga saqlash
        const user = await User.create({
            name,
            phone_number,
            password: hashedPassword,
            verification_code: verificationCode, // Tasdiqlash kodini saqlash
        });

        // SMS orqali tasdiqlash kodini yuborish
        await sendSMS(phone_number, `Sizning PayGo ilovasi uchun tasdiqlash kodingiz: ${verificationCode}`);

        res.status(201).json({
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
        let  { phone_number } = req.body;
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
            }
    } */
    try {
        const {verification_code } = req.body;
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
        await user.save();

        res.json({ message: 'Phone number verified successfully' });
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
                $password: '12356',
            }
    } */
    try {
        const {password } = req.body;
        let { phone_number } = req.body;
        phone_number = phone_number.replace(/[^\d+]/g, ''); // Telefon raqamni tozalash
        // Foydalanuvchini topish
        const user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Parolni tekshirish
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // JWT yaratish
        const token = jwt.sign({ id: user.id, phone_number: user.phone_number }, JWT_SECRET, { expiresIn: '72h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
