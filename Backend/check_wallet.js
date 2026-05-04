import mongoose from 'mongoose';
import { FoodOrder } from './src/modules/food/orders/models/order.model.js';
import { DeliveryBonusTransaction } from './src/modules/food/admin/models/deliveryBonusTransaction.model.js';
import { FoodDeliveryWithdrawal } from './src/modules/food/delivery/models/foodDeliveryWithdrawal.model.js';
import { config } from './src/config/env.js';

async function checkWallet() {
    try {
        await mongoose.connect(config.mongodbUri);
        const riderId = new mongoose.Types.ObjectId('69f6e9170cc9d2b62ef63872');
        
        const [earningsAgg, bonusAgg, withdrawalAgg] = await Promise.all([
            FoodOrder.aggregate([
                { $match: { 'dispatch.deliveryPartnerId': riderId, orderStatus: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$riderEarning' } } }
            ]),
            DeliveryBonusTransaction.aggregate([
                { $match: { deliveryPartnerId: riderId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            FoodDeliveryWithdrawal.aggregate([
                { $match: { deliveryPartnerId: riderId, status: 'approved' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const earnings = earningsAgg?.[0]?.total || 0;
        const bonus = bonusAgg?.[0]?.total || 0;
        const withdrawn = withdrawalAgg?.[0]?.total || 0;
        const total = earnings + bonus - withdrawn;

        console.log('Wallet Summary:', { earnings, bonus, withdrawn, total });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkWallet();
