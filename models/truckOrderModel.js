const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TruckOrder = sequelize.define('truck_orders', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    cargo_name:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    cargo_weight:{
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
    }

   
});

module.exports = TruckOrder;