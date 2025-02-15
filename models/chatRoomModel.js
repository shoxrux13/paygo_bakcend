const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatRoom = sequelize.define('chat_rooms', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    from_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    to_location_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    
},
    {
        schema: 'chat',
        timestamps: false,
    });

module.exports = ChatRoom;