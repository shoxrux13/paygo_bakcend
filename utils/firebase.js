const admin = require('firebase-admin');
const serviceAccount = require('../utils/firebase-service-account.json'); // Servis akkaunt fayli

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
