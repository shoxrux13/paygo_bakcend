const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Region = sequelize.define('regions', {
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
    shortname1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shortname2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shortname3: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    turn: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

},
{
timestamps: false,
});
module.exports = Region;