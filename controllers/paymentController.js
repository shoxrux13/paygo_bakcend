const Payment = require('../models/paymentModel');
const Billing = require('../models/billingModel');
const Tariff = require('../models/tariffModel');
const axios = require('axios');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const cron = require('node-cron');

const admin = require('firebase-admin');
const User = require('../models/userModel');
const { stat } = require('fs');





// Foydalanuvchini to'lovni amalga oshirish
exports.makePayment = async (req, res) => {
    /*  #swagger.tags = ['Payments']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $amount: 1000,
        }
    }
    */
    try {
        const payment = req.body;

        async function createInvoice(merchantTransId) {

            const service_id = process.env.CLICK_SERVICE_ID // Sizning xizmat ID
            const secret_key = process.env.CLICK_SECRET_KEY; // Click dan olingan maxfiy kalit
            const merchant_user_id = process.env.CLICK_MERCHANT_USER_ID; // Sizning Click foydalanuvchi ID

            const timestamp = Math.floor(Date.now() / 1000);
            const digest = crypto.createHash('sha1').update(timestamp + secret_key).digest('hex');

            // Auth header yaratish
            const authHeader = `${merchant_user_id}:${digest}:${timestamp}`;
            const url = 'https://api.click.uz/v2/merchant/invoice/create';


            const requestData = {
                service_id: service_id,
                amount: payment.amount,
                phone_number: req.user.phone_number,
                merchant_trans_id: merchantTransId
            };

            try {
                const response = await axios.post(url, requestData, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Auth': authHeader
                    }
                });

                return response.data;
            } catch (error) {
                if (error.response) {
                    console.error('Error Response:', error.response.data);
                } else {
                    console.error('Error:', error.message);
                }
                throw error;
            }
        }

        const newPayment = await Payment.create({
            user_id: req.user.id,
            amount: payment.amount,
            status: 0,
            created_at: new Date(),
        });

        // Misol:
        const paymentResponse = await createInvoice(newPayment.transaction_id);

        if (paymentResponse.error_code !== 0) {
            await Payment.update(
                { status: 3, updated_at: new Date() },
                { where: { transaction_id: newPayment.transaction_id } }
            );
            return res.status(400).json({ success: false, message: 'Payment failed', error: paymentResponse.error_note });
        } else if (paymentResponse.error_code === 0) {
            // To'lov muvaffaqiyatli
            await Payment.update(
                { invoice_id: paymentResponse.invoice_id, updated_at: new Date() },
                { where: { transaction_id: newPayment.transaction_id } }
            );


            return res.status(200).json({
                success: true,
                message: 'Payment successful',
                error_code: paymentResponse.error_code,
                invoice_id: paymentResponse.invoice_id
            });
        }


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.paymentStatus = async (req, res) => {
    /*  #swagger.tags = ['Payments']
      #swagger.security = [{
          "apiKeyAuth": []
      }]
  */
    try {
        const invoice_id = req.query.invoice_id;
        async function checkInvoiceStatus(invoiceId) {
            const service_id = process.env.CLICK_SERVICE_ID // Sizning xizmat ID
            const secret_key = process.env.CLICK_SECRET_KEY; // Click dan olingan maxfiy kalit
            const merchant_user_id = process.env.CLICK_MERCHANT_USER_ID; // Sizning Click foydalanuvchi ID

            const timestamp = Math.floor(Date.now() / 1000);
            const digest = crypto.createHash('sha1').update(timestamp + secret_key).digest('hex');

            // Auth header yaratish
            const authHeader = `${merchant_user_id}:${digest}:${timestamp}`;
            const url = `https://api.click.uz/v2/merchant/invoice/status/${service_id}/${invoiceId}`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Auth': authHeader
                    }
                });

                // console.log(response.data);

                return response.data;
            } catch (error) {
                if (error.response) {
                    console.error('Error Response:', error.response.data);
                } else {
                    console.error('Error:', error.message);
                }
                throw error;
            }
        }

        const statusResponse = await checkInvoiceStatus(invoice_id)

        if (statusResponse.status == 0) {
            res.status(200).json({
                success: true,
                message: 'To‘lov kutilmoqda',
                payment_status: statusResponse.status,
            });
        } else if (statusResponse.status == 2) {

            await Payment.update(
                { status: 2, payment_id: statusResponse.payment_id, updated_at: new Date() },
                { where: { invoice_id: invoice_id } }
            );

            const PaymentCurrent = await Payment.findOne({ where: { invoice_id: invoice_id } });

            // console.log(PaymentCurrent.amount);

            const existingRecord = await Billing.findOne({ where: { payment_id: PaymentCurrent.id } });
            if (!existingRecord) {
                await Billing.create({
                    user_id: req.user.id,
                    balance: PaymentCurrent.amount,
                    payment_id: PaymentCurrent.id,
                    created_at: Payment.updated_at,
                });
            }

            res.status(200).json({
                success: true,
                message: 'To‘lov amalga oshirildi',
                payment_status: statusResponse.status,
            });

        } else if (statusResponse.status < 0) {

            await Payment.update(
                { status: 3, updated_at: new Date() },
                { where: { invoice_id: invoice_id } }
            );

            res.status(200).json({
                success: true,
                message: 'To‘lov rad etilgan',
                payment_status: statusResponse.status,
            });
        }



    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Foydalanuvchining to'lovlar tarixini ko'rish
exports.paymentHistory = async (req, res) => {
    /*  #swagger.tags = ['Payments']
        #swagger.security = [{
            "apiKeyAuth": []
        }]
    */
    try {
        const billingWithPayments = await sequelize.query(
            `SELECT b.id, b.balance, COALESCE(tariff_id,0) as tarif_id, TO_CHAR(b.created_at, 'YYYY-MM-DD HH24:MI:SS') as date,  
            CONCAT('000','',b.id) as transaction_id, t.name1 as tariff_name
            FROM billings b
            LEFT JOIN payments p ON b.payment_id = p.id
            LEFT JOIN tariff_plans t ON b.tariff_id = t.id
            WHERE b.user_id = ${req.user.id}
            ORDER BY b.created_at DESC;`,
            { type: QueryTypes.SELECT }
        );


        if (billingWithPayments.length === 0) {
            return res.status(404).json({ success: false, message: 'Payments not found' });
        }

        billingWithPayments.map((payment) => {
            const formattedPrice = payment.balance ? new Intl.NumberFormat('uz-UZ').format(payment.balance) : 0;
            if (payment.tarif_id == 0) {
                payment.balance = '+'+formattedPrice;
            }else{
                payment.balance = '-'+formattedPrice;
            }
        });

        return res.status(200).json({ success: true, data: billingWithPayments });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function checkNewPaymentStatus() {
    try {
        const invoices = await sequelize.query(
            `SELECT  p.id, p.status, p.invoice_id
            FROM payments p
            WHERE p.status = 0 AND invoice_id IS NOT NULL
            ORDER BY p.created_at DESC;
            `,
            { type: QueryTypes.SELECT }
        );

        for (const invoice of invoices) {
            const invoice_id = invoice.invoice_id;

            async function checkInvoiceStatus(invoiceId) {
                const service_id = process.env.CLICK_SERVICE_ID; // Xizmat ID
                const secret_key = process.env.CLICK_SECRET_KEY; // Maxfiy kalit
                const merchant_user_id = process.env.CLICK_MERCHANT_USER_ID; // Merchant foydalanuvchi ID

                const timestamp = Math.floor(Date.now() / 1000);
                const digest = crypto.createHash('sha1').update(timestamp + secret_key).digest('hex');
                const authHeader = `${merchant_user_id}:${digest}:${timestamp}`;
                const url = `https://api.click.uz/v2/merchant/invoice/status/${service_id}/${invoiceId}`;

                try {
                    const response = await axios.get(url, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Auth': authHeader,
                        },
                    });

                    return response.data;
                } catch (error) {
                    console.error('Error fetching invoice status:', error.message);
                    throw error;
                }
            }

            const statusResponse = await checkInvoiceStatus(invoice_id);

            if (statusResponse.status === 0) {
            } else if (statusResponse.status === 2) {
                await Payment.update(
                    { status: 2, payment_id: statusResponse.payment_id, updated_at: new Date() },
                    { where: { invoice_id: invoice_id } }
                );

                const PaymentCurrent = await Payment.findOne({ where: { invoice_id: invoice_id } });
                const existingRecord = await Billing.findOne({ where: { payment_id: PaymentCurrent.id } });

                if (!existingRecord) {
                    await Billing.create({
                        user_id: PaymentCurrent.user_id,
                        balance: PaymentCurrent.amount,
                        payment_id: PaymentCurrent.id,
                        created_at: new Date(),
                    });
                }

                await sendNotification(PaymentCurrent.user_id, 'Yangi xabar', `Hisobingiz ${PaymentCurrent.amount} so‘mga to‘ldirildi`);

            } else if (statusResponse.status < 0) {
                const PaymentCurrent = await Payment.findOne({ where: { invoice_id: invoice_id } });
                await Payment.update(
                    { status: 3, updated_at: new Date() },
                    { where: { invoice_id: invoice_id } }
                );

                await sendNotification(PaymentCurrent.user_id, 'Yangi xabar', `To‘lov rad etildi`);


            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function sendNotification(user_id, title, body) {
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
                title,
                body,
            },
        };

        // FCM orqali yuborish
        const response = await admin.messaging().send(message);
        console.log('Bildirishnoma muvaffaqiyatli yuborildi:', response);
        return response;
    } catch (error) {
        console.error('Bildirishnomani yuborishda xato:', error.message);
        throw error;
    }
}

//Tarif rejaga obuna bo'lish
exports.subscribeTariff = async (req, res) => {
    /*  #swagger.tags = ['Payments']
         #swagger.security = [{
          "apiKeyAuth": []
      }]
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $tariff_id: 1,
                $buy: false
            }
        }
    */
    try {


        const tariff_id = req.body.tariff_id;
        const buy = req.body.buy;
        const tariff = await Tariff.findOne({ where: { id: tariff_id } });



        if (!tariff) {
            return res.status(404).json({ success: false, message: 'Tariff not found' });
        }

        const [userBalance] = await sequelize.query(
            `SELECT  (
                        SELECT COALESCE(SUM(b1.balance), 0)
                        FROM billings b1
                        WHERE b1.user_id = ${req.user.id} AND b1.tariff_id IS NULL
                    ) - (
                        SELECT COALESCE(SUM(b2.balance), 0)
                        FROM billings b2
                        WHERE b2.user_id = ${req.user.id} AND b2.tariff_id IS NOT NULL
                    ) AS balance`,
            { type: QueryTypes.SELECT }
        );



        const [lastBilling] = await sequelize.query(
            `SELECT tariff_id, created_at
                        FROM billings
                        WHERE user_id = ${req.user.id} AND tariff_id = ${tariff_id}
                        ORDER BY created_at DESC limit 1;
                    `,
            { type: QueryTypes.SELECT }
        );

        // console.log(lastBilling);



        if (Number(userBalance.balance) < Number(tariff.price)) {
            return res.status(200).json({
                success: false,
                status: 3,
                message: 'Hisobingizda yetarli mablag‘ mavjud emas',
                balance: userBalance.balance
            });
        }

        if (lastBilling) {


            // Tarif muddati (oylar bo‘yicha)
            let months = 0;
            if (lastBilling.tariff_id === 1) months = 1;
            else if (lastBilling.tariff_id === 2) months = 6;
            else if (lastBilling.tariff_id === 3) months = 12;





            // Tarif tugash sanasi
            const expirationDate = new Date(lastBilling.created_at);
            expirationDate.setMonth(expirationDate.getMonth() + months);

            // Bugungi sana
            const today = new Date();



            if (lastBilling && !buy && expirationDate > today) {
                // Sanani kerakli formatga o‘tkazish
                const year = expirationDate.getFullYear();
                const month = String(expirationDate.getMonth() + 1).padStart(2, '0'); // Oyni ikki xonali qilish
                const day = String(expirationDate.getDate()).padStart(2, '0'); // Kundni ikki xonali qilish
                const hours = String(expirationDate.getHours()).padStart(2, '0'); // Soatni ikki xonali qilish
                const minutes = String(expirationDate.getMinutes()).padStart(2, '0'); // Daqiqani ikki xonali qilish

                const formattedExpirationDate = `${year}-${month}-${day} ${hours}:${minutes}`;
                return res.status(200).json({
                    success: true,
                    status: 2,
                    message: 'Tarifning tugash muddati bor agar qayta obuna bo‘lishni xohlasangiz tarifingiz yangilanadi',
                    expirationDate: formattedExpirationDate,
                });
            }
        }




        await Billing.create({
            user_id: req.user.id,
            balance: tariff.price,
            tariff_id: tariff_id,
            created_at: new Date(),
        });



        data = {
            success: true,
            status: 1,
            balance: -tariff.price,
            tariff: tariff.name1,
            message: 'Tarifga obuna bo‘ldingiz'
        };

        res.status(200).json(data);


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};


// Avtomatik ishga tushirish uchun cron
cron.schedule('*/5 * * * * *', async () => {
    await checkNewPaymentStatus();
});






