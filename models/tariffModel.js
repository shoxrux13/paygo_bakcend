const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TariffPlan = sequelize.define('tariff_plans', {
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
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    monthly: {
        type: DataTypes.STRING,
        allowNull: true,
    },
},
    {
        timestamps: false,
    });

module.exports = TariffPlan;