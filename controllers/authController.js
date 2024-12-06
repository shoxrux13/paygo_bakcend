const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // User modelini import qiling

// Maxfiy kalit
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Foydalanuvchini ro'yxatdan o'tkazish
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Parolni xeshlash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yangi foydalanuvchi yaratish
        const user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Tizimga kirish
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Foydalanuvchini topish
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Parolni tekshirish
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // JWT yaratish
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
