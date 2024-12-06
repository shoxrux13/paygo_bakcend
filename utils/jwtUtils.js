const jwt = require('jsonwebtoken');

exports.createToken = (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
};
