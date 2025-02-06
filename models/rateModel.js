const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RateModel = sequelize.define('rating', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    passenger_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    driver_rating: {
        type: DataTypes.DECIMAL(2,1),
        allowNull: true,
    },
    passenger_rating: {
        type: DataTypes.DECIMAL(2,1),
        allowNull: true,
    }, 
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }

});

module.exports = RateModel;