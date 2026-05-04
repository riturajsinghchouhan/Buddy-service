import mongoose from 'mongoose';
import { FoodOrder } from './src/modules/food/orders/models/order.model.js';
import { config } from './src/config/env.js';

async function checkRiderOrders() {
    try {
        await mongoose.connect(config.mongodbUri);
        const riderId = '69f6e9170cc9d2b62ef63872';
        const orders = await FoodOrder.find({
            'dispatch.deliveryPartnerId': new mongoose.Types.ObjectId(riderId),
            orderStatus: 'delivered'
        }).lean();
        console.log('Delivered Orders:', orders.length);
        if (orders.length > 0) {
            console.log('Earnings:', orders.map(o => ({ id: o.order_id, earning: o.riderEarning })));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkRiderOrders();
