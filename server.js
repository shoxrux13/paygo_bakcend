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
const  HOST = process.env.HOST || '95.130.227.93';

// Middleware
app.use(express.json());

const corsOptions = {
    origin: ['http://paygo.app-center.uz', 'https://paygo.app-center.uz', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Cookie va autentifikatsiya ma'lumotlari uchun
};
app.use(cors(corsOptions));

// PostgreSQL ulanishi
connectDB();

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Swagger UI
app.use('/docs',  cors(corsOptions), swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// Auth yo'llarini ulash
app.use('/api/auth', authRoutes);

// Himoyalangan yo'llar
app.use('/api/users', userRoutes);

// Serverni ishga tushirish
app.listen(PORT, () => console.log(`Server running on http://${HOST}:${PORT}`));
