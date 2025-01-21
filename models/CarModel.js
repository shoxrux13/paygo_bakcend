const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CarModel = sequelize.define('car_models', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name3: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    timestamps: false, // createdAt va updatedAt ustunlari avtomatik yaratiladi
});

module.exports = CarModel;