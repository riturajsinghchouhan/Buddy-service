import mongoose from 'mongoose';
import { FoodOrder } from './Backend/src/modules/food/orders/models/order.model.js';
import { FoodDeliveryPartner } from './Backend/src/modules/food/delivery/models/deliveryPartner.model.js';
import { getDeliveryPartnerEarnings } from './Backend/src/modules/food/delivery/services/delivery.service.js';

async function test() {
    await mongoose.connect('mongodb://localhost:27017/foodelo'); // Assuming local db name
    
    const partner = await FoodDeliveryPartner.findOne({ status: 'approved' });
    if (!partner) {
        console.log("No approved partner found");
        process.exit(0);
    }
    
    console.log("Testing for Partner:", partner.name, partner._id);
    
    const earnings = await getDeliveryPartnerEarnings(partner._id, {});
    console.log("Earnings Result:", JSON.stringify(earnings, null, 2));
    
    // Check orders directly
    const { start, end } = earnings.week || {};
    const orders = await FoodOrder.find({
        'dispatch.deliveryPartnerId': partner._id,
        orderStatus: 'delivered'
    }).lean();
    
    console.log("Total Delivered Orders for this partner:", orders.length);
    if (orders.length > 0) {
        console.log("Sample Order riderEarning:", orders[0].riderEarning);
        console.log("Sample Order deliveryFee:", orders[0].pricing?.deliveryFee);
        console.log("Sample Order deliveredAt:", orders[0].deliveryState?.deliveredAt || orders[0].deliveredAt);
    }

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
