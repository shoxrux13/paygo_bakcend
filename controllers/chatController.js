
const { QueryTypes, or } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/userModel');
const ChatRoom = require('../models/chatRoomModel');
const ChatMember = require('../models/chatMemberModel');
const Message = require('../models/messageModel');
const Vehicle = require('../models/vehicleModel');
const upload = require("../config/multerConfig"); // Fayl yuklash konfiguratsiyasi




const TaxiOrder = require('../models/taxiOrderModel');
const TruckOrder = require('../models/truckOrderModel');




// Chat xonasini yaratish
exports.createChat = async (req, res) => {
    /*  #swagger.tags = ['Chats']
    #swagger.security = [{
        "apiKeyAuth": []
    }]

    */
    try {


        const [user] = await sequelize.query(
            `SELECT u.id, u.name, v.from_location, v.to_location
             FROM users u
             LEFT JOIN vehicles v ON u.id = v.user_id
             WHERE u.id = ${req.user.id}

            `,
            { type: QueryTypes.SELECT }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.from_location || !user.to_location) {
            return res.status(400).json({ message: 'From and to locations are required' });
        }


        const [chatRoom] = await sequelize.query(
            `INSERT INTO chat.chat_rooms (from_location_id, to_location_id)
                 VALUES (:from_location_id, :to_location_id)
                 ON CONFLICT (from_location_id, to_location_id) DO NOTHING
                 RETURNING id;`,
            {
                replacements: { from_location_id: user.from_location, to_location_id: user.to_location },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        // Agar `chatRoom` undefined yoki null bo‘lsa, mavjud ID ni olish
        let chatRoomId = chatRoom?.id;

        if (!chatRoomId) {
            const [existingChatRoom] = await sequelize.query(
                `SELECT id FROM chat.chat_rooms WHERE from_location_id = :from_location_id AND to_location_id = :to_location_id;`,
                {
                    replacements: { from_location_id: user.from_location, to_location_id: user.to_location },
                    type: sequelize.QueryTypes.SELECT,
                }
            );
            chatRoomId = existingChatRoom?.id || "Already exists";
        }

        // Foydalanuvchiga natijani qaytarish
        res.status(200).json({ success: true, chat_room_id: chatRoomId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


//Join chat
exports.joinChat = async (req, res) => {
    /*  #swagger.tags = ['Chats']
    #swagger.security = [{
        "apiKeyAuth": []
    }]

    */
    try {
        const { chat_room_id } = req.body;

        if (!chat_room_id) {
            return res.status(400).json({ message: 'Chat room ID is required' });
        }

        const [chatRoom] = await sequelize.query(
            `SELECT id FROM chat.chat_rooms WHERE id = :chat_room_id;`,
            {
                replacements: { chat_room_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!chatRoom) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        const [chatMember] = await sequelize.query(
            `INSERT INTO chat.chat_members (chat_room_id, user_id)
             VALUES (:chat_room_id, :user_id)
             ON CONFLICT (chat_room_id, user_id) DO NOTHING
             RETURNING id;`,
            {
                replacements: { chat_room_id, user_id: req.user.id },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        if (!chatMember) {
            return res.status(400).json({ message: 'User already joined the chat' });
        }

        res.status(200).json({ success: true, 'User joined the chat': chat_room_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


// Xabar yuborish
exports.sendMessage = async (req, res) => {
    /*  
    #swagger.tags = ['Chats']
    #swagger.description = 'Foydalanuvchi chatga matn, rasm yoki audio fayl yuborishi mumkin.'
    #swagger.consumes = ['multipart/form-data']
    #swagger.security = [{ "apiKeyAuth": [] }]
    
    #swagger.parameters['file'] = {
        in: 'formData',
        type: 'file',
        description: 'Yuklanadigan rasm yoki audio fayl',
        required: false
    }
    #swagger.parameters['chat_room_id'] = {
        in: 'formData',
        type: 'integer',
        description: 'Xabar yuboriladigan chat xonasi ID',
        required: true
    }
    #swagger.parameters['message_text'] = {
        in: 'formData',
        type: 'string',
        description: 'Matnli xabar (Agar fayl bo‘lsa, bu talab qilinmaydi)',
        required: false
    }
    */

    try {
        // Multer bilan fayl yuklash
        upload.single("file")(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { chat_room_id, message_text } = req.body;
            const sender_id = req.user.id; // JWT dan foydalanuvchi ID sini olish
            const file = req.file;

            let message_type = "text";
            let media_url = null;

            // Agar fayl mavjud bo‘lsa, uni URL sifatida saqlaymiz
            if (file) {
                if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("audio/")) {
                    return res.status(400).json({ error: "Faqat rasm yoki audio fayllarni yuklash mumkin!" });
                }

                message_type = file.mimetype.startsWith("image/") ? "photo" : "audio";
                media_url = `/uploads/chat/${file.filename}`;
            }

            // Bazaga saqlash
            await sequelize.query(
                `INSERT INTO chat.messages (chat_room_id, sender_id, message_type, message_text, media_url)
                 VALUES (:chat_room_id, :sender_id, :message_type, :message_text, :media_url);`,
                {
                    replacements: { chat_room_id, sender_id, message_type, message_text, media_url },
                    type: sequelize.QueryTypes.INSERT,
                }
            );

            res.json({ success: true, message: "Xabar yuborildi", media_url });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xabarlar ro‘yxati
exports.getMessages = async (req, res) => {
    /*  #swagger.tags = ['Chats']
    #swagger.security = [{
        "apiKeyAuth": []
    }]

    */
    const chat_room_id = req.query.chat_room_id || 0;
    try {
        const messages = await sequelize.query(
            `SELECT m.id, m.sender_id, m.message_type, m.message_text, m.media_url, m.created_at, u.name as sender_name
             FROM chat.messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.chat_room_id = :chat_room_id
             ORDER BY m.created_at ASC;`,
            {
                replacements: { chat_room_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}






