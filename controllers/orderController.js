
const axios = require('axios');
const crypto = require('crypto');
const { QueryTypes, or } = require('sequelize');
const { sequelize } = require('../config/database');
const cron = require('node-cron');
const User = require('../models/userModel');

const TaxiOrder = require('../models/taxiOrderModel');
const TruckOrder = require('../models/truckOrderModel');
const { log } = require('console');


// Taxi order yaratish
exports.makeOrder = async (req, res) => {
    /*  #swagger.tags = ['Orders']
    #swagger.security = [{
        "apiKeyAuth": []
    }]
    #swagger.parameters['body'] = {
    in: 'body',
    schema: {
        $from_location: 12,
        $to_location: 9,
        $passenger_count: 2,
        $pochta: "Pochta bor Quqonga",
        $time_id: 1
    }
}
*/
    const { from_location, to_location, passenger_count, pochta = null, time_id } = req.body;
    const passenger_id = req.user.id;
    const status = 1;
    try {
        const order = await TaxiOrder.create({
            passenger_id, from_location, to_location, status, passenger_count, pochta, time_id
        });
        res.status(201).json(
            {
                status: 'success',
                message: 'Order created successfully',
                order
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

//Taxi orderlarni olish 
exports.getMyOrders = async (req, res) => {
    /*  #swagger.tags = ['Orders']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        

        const orders = await sequelize.query(
            `SELECT o.id, r1.name1 as from_location, r2.name1 as to_location,
             o.passenger_count, o.pochta,  t.name1 as time, os.name1 as status
             FROM taxi_orders o
             LEFT JOIN regions r1 ON o.from_location = r1.id
             LEFT JOIN regions r2 ON o.to_location = r2.id
             LEFT JOIN times t ON o.time_id = t.id
             LEFT JOIN order_statuses os ON o.status = os.id
             WHERE ${req.user.role === 1 ? `o.passenger_id = ${req.user.id}` : `o.driver_id = ${req.user.id}` }
             ORDER BY o.id DESC
            `,
            { type: QueryTypes.SELECT }
        );
        res.status(200).json({ 
            status: 200, 
            orders 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

//Taxi orderlarni olish 
exports.getNewTaxiOrders = async (req, res) => {
    /*  #swagger.tags = ['Orders']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {

        const orders = await sequelize.query(
            `SELECT o.id, r1.name1 as from_location, r2.name1 as to_location,
             o.passenger_count, o.pochta,  t.name1 as time, os.name1 as status,
                u.name
             FROM taxi_orders o
             LEFT JOIN vehicles v ON v.user_id = ${req.user.id}
             LEFT JOIN users u ON u.id = o.passenger_id
             LEFT JOIN regions r1 ON o.from_location = r1.id
             LEFT JOIN regions r2 ON o.to_location = r2.id
             LEFT JOIN times t ON o.time_id = t.id
             LEFT JOIN order_statuses os ON o.status = os.id
             WHERE o.driver_id IS NULL AND o.status = 1 AND
               ( (o.from_location = v.from_location AND o.to_location = v.to_location) OR (o.from_location = v.to_location AND o.to_location = v.from_location)  )
             ORDER BY o.id DESC
            `,
            { type: QueryTypes.SELECT }
        );
        res.status(200).json({ 
            status: 200, 
            orders 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}









