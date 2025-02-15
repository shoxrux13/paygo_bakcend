const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMember = sequelize.define('chat_members', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    chat_room_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: true
    },
    
},
    {
        schema: 'chat',
        timestamps: false,
    });

module.exports = ChatMember;