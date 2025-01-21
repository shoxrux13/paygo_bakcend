const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET); // Tokenni tekshirish
        // console.log('Token verified successfully:', user);
        req.user = user; // Foydalanuvchi ma'lumotlarini so'rovga qo'shish
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};