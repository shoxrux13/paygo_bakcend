const User = require('../models/userModel');

// Foydalanuvchilarni olish
exports.getUsers = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const users = await User.findAll();

        data = users.map((user) => {
            return {
                id: user.id,
                name: user.name,
                phone_number: user.phone_number,
            };
        });

        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Foydalanuvchini id bo'yicha olish
exports.getUserById = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['id'] = { description: 'User ID' }
    */
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        data = {
            id: user.id,
            name: user.name,
            phone_number: user.phone_number,
        };

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
