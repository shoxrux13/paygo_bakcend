const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Time = sequelize.define('times', {
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
},
    {
        timestamps: false,
    });

module.exports = Time;