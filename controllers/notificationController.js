const admin = require('../utils/firebase'); // Firebase Admin SDK ni ulash
const User  = require('../models/userModel'); // User modeli bilan bog'lash


exports.sendNotificationToUser = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $user_id: 4,
            $body: 'Bildirishnoma matni',
        }
    }
    */
    const { user_id, body } = req.body;
    
    try {
        
        await sendNotification(user_id, body);
        res.status(200).send('Bildirishnoma muvaffaqiyatli yuborildi.');
    } catch (error) {
        res.status(500).send('Bildirishnoma yuborishda xato yuz berdi.');
    }
       
};

// FCM orqali bildirishnoma yuborish funksiyasi
async function sendNotification(user_id,  body) {
    try {
        // Foydalanuvchi ma'lumotlarini olish
        
        const user = await User.findOne({ where: { id: user_id } });
        
        if (!user || !user.fcm_token) {
            throw new Error('Foydalanuvchi topilmadi yoki FCM token mavjud emas.');
        }

        

        // Bildirishnoma ma'lumotlari
        const message = {
            token: user.fcm_token,
            notification: {
                title: 'Yangi xabar',
                body,
            },
        };

        // FCM orqali yuborish
        const response = await admin.messaging().send(message);
        return response;
    } catch (error) {
        console.error('Bildirishnomani yuborishda xato:', error.message);
        throw error;
    }
}


