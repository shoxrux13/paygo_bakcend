const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    verification_code: { // Tasdiqlash kodi uchun maydon
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_verified: { // Tasdiqlanganligini aniqlash uchun maydon
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    refresh_token: {
        type: DataTypes.TEXT, // Refresh token uchun matn saqlanadi
        allowNull: true,
    },
    fcm_token: {
        type: DataTypes.TEXT, // FCM token uchun matn saqlanadi
        allowNull: true,
    },
});

module.exports = User;
