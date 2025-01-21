const axios = require('axios');

// Tasdiqlash kodi generatsiya qilish
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 xonali tasdiqlash kodi
};

const SMS_API_LOGIN = process.env.SMS_API_LOGIN ;
const SMS_API_PASSWORD = process.env.SMS_API_PASSWORD;

const sendSMS = async (phone, text) => {
    phone = phone.replace(/[\+\(\)\s-]/g, ''); // +, (, ), bo'sh joy va - belgilardan tozalash
    const smsData = [
        {
            phone: phone, // Telefon raqam
            text: text,   // SMS matni
        },
    ];

    const payload = new URLSearchParams({
        login: SMS_API_LOGIN, // API login
        password: SMS_API_PASSWORD, // API parol
        data: JSON.stringify(smsData),
    });

    try {
        const response = await axios.post('http://185.8.212.184/smsgateway/', payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Node.js SMS Client',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to send SMS:', error.message);
        throw new Error('SMS sending failed');
    }
};

module.exports = { generateVerificationCode, sendSMS };