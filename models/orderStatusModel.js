const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderStatus = sequelize.define('order_status', {
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
});

module.exports = OrderStatus;