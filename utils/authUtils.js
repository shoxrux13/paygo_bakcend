const axios = require('axios');

// Tasdiqlash kodi generatsiya qilish
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 xonali tasdiqlash kodi
};



const sendSMS = async (phone, text) => {
    const smsData = [
        {
            phone: phone, // Telefon raqam
            text: text,   // SMS matni
        },
    ];

    const payload = new URLSearchParams({
        login: 'Bekmen', // API login
        password: '476M35Ez1sW42xoBen8X', // API parol
        data: JSON.stringify(smsData),
    });

    try {
        const response = await axios.post('http://185.8.212.184/smsgateway/', payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Node.js SMS Client',
            },
        });

        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to send SMS:', error.message);
        throw new Error('SMS sending failed');
    }
};

module.exports = { generateVerificationCode, sendSMS };