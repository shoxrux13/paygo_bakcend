const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaxiOrder = sequelize.define('taxi_orders', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    passenger_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    from_location:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    to_location:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    passenger_count:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    pochta:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    time_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
    }, 

   
});

module.exports = TaxiOrder;