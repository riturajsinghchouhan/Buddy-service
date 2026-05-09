
import mongoose from 'mongoose';
import { FoodOrder } from '../src/modules/food/orders/models/order.model.js';
import { FoodDeliveryWithdrawal } from '../src/modules/food/delivery/models/foodDeliveryWithdrawal.model.js';
import { DeliveryBonusTransaction } from '../src/modules/food/admin/models/deliveryBonusTransaction.model.js';

async function test() {
    await mongoose.connect('mongodb+srv://buddy:buddys@cluster0.6ykakvc.mongodb.net/?appName=Cluster0');
    console.log('Connected to DB');

    const partnerId = new mongoose.Types.ObjectId('69f6e9170cc9d2b62ef63872');
    
    const count = await FoodOrder.countDocuments({
        $or: [
            { 'dispatch.deliveryPartnerId': partnerId },
            { 'dispatch.sharedPartnerId': partnerId }
        ],
        orderStatus: 'delivered'
    });
    console.log('Total Delivered Orders:', count);

    const withdrawals = await FoodDeliveryWithdrawal.aggregate([
        { $match: { deliveryPartnerId: partnerId, status: { $in: ['Approved', 'Completed', 'Processed', 'approved', 'completed', 'processed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log('Total Withdrawals:', JSON.stringify(withdrawals, null, 2));

    const bonuses = await DeliveryBonusTransaction.aggregate([
        { $match: { deliveryPartnerId: partnerId, status: 'credited' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log('Total Bonuses:', JSON.stringify(bonuses, null, 2));

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
