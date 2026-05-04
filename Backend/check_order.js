import mongoose from 'mongoose';
import { FoodOrder } from './src/modules/food/orders/models/order.model.js';
import { config } from './src/config/env.js';

async function checkOrder() {
    try {
        await mongoose.connect(config.mongodbUri);
        const order = await FoodOrder.findOne({ 
            $or: [
                { order_id: 'FOD-4884274' },
                { orderId: 'FOD-4884274' },
                { displayOrderId: 'FOD-4884274' }
            ]
        }).lean();
        if (order) {
            console.log('Order Details:', JSON.stringify(order, null, 2));
        } else {
            const last = await FoodOrder.findOne({}).sort({ createdAt: -1 }).lean();
            console.log('Order not found. Last order in DB:', JSON.stringify(last, null, 2));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkOrder();
