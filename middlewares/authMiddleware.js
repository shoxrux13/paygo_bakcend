const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET); // Tokenni tekshirish
        req.user = user; // Foydalanuvchi ma'lumotlarini so'rovga qo'shish
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
