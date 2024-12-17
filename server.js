require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '95.130.227.93';

// Middleware
app.use(express.json());

app.use(cors({
    origin: '*', // Barcha domenlarga ruxsat berish
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


// PostgreSQL ulanishi
connectDB();

app.use(express.static(path.join(__dirname, 'public')));

const ipFilterMiddleware = (allowedIPs) => (req, res, next) => {
    // IP manzilni olish
    let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // IPv6 prefiksni olib tashlash
    if (clientIP.includes('::ffff:')) {
        clientIP = clientIP.split('::ffff:')[1];
    }


    // IP tekshirish
    if (!allowedIPs.includes(clientIP)) {
        const path = require('path'); // Path modulini ulash kerak
        return res.sendFile(path.join(__dirname, '404.html'));
    }

    next();
};


// Swagger UI faqat ruxsat berilgan IP'lar uchun
const allowedIPsForSwagger = ['10.100.26.2', '195.158.24.85']; // Swagger uchun ruxsat berilgan IP'lar
app.use('/docs', ipFilterMiddleware(allowedIPsForSwagger),  swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Foydalanuvchi uchun asosiy sahifa (agar kerak bo'lsa)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Middleware: faqat /services/zyber/api bilan boshlanmagan so‘rovlarni 404.html sahifasiga yo'naltirish
app.use((req, res, next) => {
    if (!req.path.startsWith('/services/zyber/api')) {
        return res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
    next();
});

// Auth yo'llarini ulash
app.use('/services/zyber/api/auth', authRoutes);

// Himoyalangan yo'llar
app.use('/services/zyber/api/users', userRoutes);



// Serverni ishga tushirish
app.listen(PORT, () => console.log(`Server running on http://${HOST}:${PORT}`));
