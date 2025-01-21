const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('vehicles', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    model_id : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    plate_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    from_location: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    to_location: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
   
});

module.exports = Vehicle;