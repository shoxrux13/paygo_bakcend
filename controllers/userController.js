const User = require('../models/userModel');
const Role = require('../models/roleModel');
const e = require('express');

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
    */
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
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

// Foydalanuvchini statusini olish
exports.getUserStatus = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ status: user.status , role_id: user.role_id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Rollarni olish
exports.getRoles = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const roles = await Role.findAll(
            {
                attributes: ['id', ['name1' , 'name']],
                where: { id: [1, 2, 3] },
                order: [['id', 'ASC']]
            }
        );
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Foydalanuvchini rolini taxrirlash
exports.updateUserRole = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security
        #swagger.parameters['role_id'] = { description: 'Role ID' }
    */
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role_id = req.body.role_id;
        await user.save();

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
