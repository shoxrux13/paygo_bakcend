require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// PostgreSQL ulanishi
connectDB();


// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Asosiy yo'l
app.get('/', (req, res) => {
    res.send('Express API is running...');
});

// Auth yo'llarini ulash
app.use('/api/auth', authRoutes);

// Himoyalangan yo'llar
app.use('/api/users', userRoutes);

// Serverni ishga tushirish
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
