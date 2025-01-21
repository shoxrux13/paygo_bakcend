require('dotenv').config();
const { Sequelize } = require('sequelize');

// PostgreSQL ulanishi
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    timestamps: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected!');

        // await sequelize.sync({ alter: true });
        // console.log('Tables synced');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
