require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL ulanishi
connectDB();


// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Asosiy yo'l
// app.get('/', (req, res) => {
//     res.send('Express API is running...');
// });

// Auth yo'llarini ulash
app.use('/api/auth', authRoutes);

// Himoyalangan yo'llar
app.use('/api/users', userRoutes);

// Serverni ishga tushirish
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
