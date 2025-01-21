const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentModel = sequelize.define('payments', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    payment_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: false, // createdAt va updatedAt ustunlari avtomatik yaratiladi
    hooks: {
        beforeCreate: async (payment, options) => {
            // Oxirgi payment ni topamiz
            const lastPayment = await PaymentModel.findOne({
                order: [['created_at', 'DESC']], // Oxirgi yaratilgan payment ni olamiz
            });

            let newTransactionId = '0001'; // Agar birinchi payment bo'lsa

            if (lastPayment && lastPayment.transaction_id) {
                // Oxirgi transaction_id ni olamiz va uni raqamga aylantiramiz
                const lastTransactionId = parseInt(lastPayment.transaction_id, 10);
                // Yangi transaction_id ni hisoblaymiz
                newTransactionId = String(lastTransactionId + 1).padStart(4, '0'); // 4 xonali formatda
            }

            // Yangi transaction_id ni o'rnatamiz
            payment.transaction_id = newTransactionId;
        },
    },
});

module.exports = PaymentModel;