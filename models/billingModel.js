const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Billing = sequelize.define('billings', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    balance: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    tariff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    payment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },


},
    {
        timestamps: false,
    });

module.exports = Billing;