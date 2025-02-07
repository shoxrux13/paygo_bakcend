const User = require('../models/userModel');
const Role = require('../models/roleModel');
const Vehicle = require('../models/vehicleModel');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');


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
        
        const [user] = await sequelize.query(
            `SELECT u.id, u.name, u.phone_number, r.name1 AS role,
            u.rating, cb.name1 AS brand, cm.name1 AS model, v.plate_number,
            r1.name1 AS from_location, r2.name1 AS to_location
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN vehicles v ON u.id = v.user_id
            LEFT JOIN car_brands cb ON v.brand_id = cb.id
            LEFT JOIN car_models cm ON v.model_id = cm.id
            LEFT JOIN regions r1 ON v.from_location = r1.id
            LEFT JOIN regions r2 ON v.to_location = r2.id
            WHERE u.id = ${req.user.id}
            `,
            { type: QueryTypes.SELECT }
        );

        console.log(user);
        

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const [balance] = await sequelize.query(
            `SELECT  (
                        SELECT COALESCE(SUM(b1.balance), 0)
                        FROM billings b1
                        WHERE b1.user_id = ${user.id} AND b1.tariff_id IS NULL
                    ) - (
                        SELECT COALESCE(SUM(b2.balance), 0)
                        FROM billings b2
                        WHERE b2.user_id = ${user.id} AND b2.tariff_id IS NOT NULL
                    ) AS balance`,
            { type: QueryTypes.SELECT }
        );

        



        const formattedPrice = balance ? new Intl.NumberFormat('uz-UZ').format(balance.balance) : 0;
        const fromat_plate_number = parsePlateNumber(user.plate_number);
        data = {
            id: user.id,
            name: user.name,
            phone_number: user.phone_number,
            balance: formattedPrice,
            role: user.role,
            rating: user.rating,
            vehicle: {
                brand: user.brand,
                model: user.model,
                region_number: fromat_plate_number.region_number,
                plate_number: fromat_plate_number.plate_number,
                from_location: user.from_location,
                to_location: user.to_location
            }
        };

        res.status(200).json(data);
    } catch (error) {
        console.log(error.message);
        
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

        res.status(200).json({ status: user.status, role_id: user.role_id });
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
                attributes: ['id', ['name1', 'name']],
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
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {

        const role_id = req.body.role_id;

        console.log(role_id);


        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role_id = role_id;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'User role updated successfully'
        });
    } catch (error) {
        console.log(error.message);

        res.status(500).json({ error: error.message });
    }
}

exports.addVehicle = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $brand_id: 1,
            $model_id: 3,
            $plate_number: '01A123AA',
            $from_location: 12,
            $to_location: 13,
        }
    }
    */
    try {
        const vehicle = req.body;


        const newVehicle = await Vehicle.create({
            user_id: req.user.id,
            brand_id: vehicle.brand_id,
            model_id: vehicle.model_id,
            plate_number: vehicle.plate_number,
            from_location: vehicle.from_location,
            to_location: vehicle.to_location,
        });


        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            vehicle: newVehicle,
        });
    } catch (error) {
        console.log(error.message);

        res.status(500).json({ error: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    /*  #swagger.tags = ['Users']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $lat: '46.45423543',
            $long: '67.4564556',
        }
    }
    */
    try {
        const {lat, long} = req.body;


        const vehicle = await Vehicle.update({ lat, long }, {
            where: { user_id: req.user.id }
        });

        res.status(200).json({
            status:200,
            message: "Location update successfully",
        });
    } catch (error) {
        console.log(error.message);

        res.status(500).json({ error: error.message });
    }
};

function parsePlateNumber(plate_number) {
    // 1. Region raqamini olish (birinchi 2 belgini ajratish)
    const region_number = plate_number.substring(0, 2);

    // 2. Qolgan qismini ajratish va formatga qarab ishlash
    let plate_details = plate_number.substring(2).trim();

    // 3. Raqamning qolgan qismini formatlash
    if (/^[A-Z]/.test(plate_details)) {
        // Agar raqam harf bilan boshlansa
        plate_details = `${plate_details[0]} ${plate_details.slice(1, 4)} ${plate_details.slice(4)}`;
    } else {
        // Agar raqam raqamlar bilan boshlansa
        plate_details = `${plate_details.slice(0, 3)} ${plate_details.slice(3)}`;
    }

    // 4. Natijani qaytarish
    return {
        region_number,
        plate_number: plate_details,
    };
}
