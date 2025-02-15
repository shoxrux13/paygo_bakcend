const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('messages', {
    //schema
    
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    chat_room_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    sender_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    message_type: {
        type: DataTypes.STRING,
        allowNull: true,
        check: ['text', 'image', 'file'],
    },
    message_text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    media_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
    
},
    {
        schema: 'chat',
        timestamps: false,
    });

module.exports = Message;