const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CarBrand = sequelize.define('car_brands', {
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
    
}, {
    timestamps: false, // createdAt va updatedAt ustunlari avtomatik yaratiladi
});

module.exports = CarBrand;