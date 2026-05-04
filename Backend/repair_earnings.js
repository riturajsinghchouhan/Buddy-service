import mongoose from 'mongoose';
import { FoodOrder } from './src/modules/food/orders/models/order.model.js';
import { FoodRestaurant } from './src/modules/food/restaurant/models/restaurant.model.js';
import { FoodDeliveryCommissionRule } from './src/modules/food/admin/models/deliveryCommissionRule.model.js';
import { config } from './src/config/env.js';

// Haversine formula
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function getRiderEarning(distanceKm, rules) {
    const d = Number(distanceKm);
    if (!Number.isFinite(d) || d <= 0) return 0;
    if (!rules.length) return 0;

    const sorted = [...rules].sort((a, b) => (a.minDistance || 0) - (b.minDistance || 0));
    const baseRule = sorted.find((r) => Number(r.minDistance || 0) === 0) || null;
    if (!baseRule) return 0;

    let earning = Number(baseRule.basePayout || 0);
    for (const r of sorted) {
        const perKm = Number(r.commissionPerKm || 0);
        if (!Number.isFinite(perKm) || perKm <= 0) continue;
        const min = Number(r.minDistance || 0);
        const max = r.maxDistance == null ? null : Number(r.maxDistance);
        if (d <= min) continue;
        const upper = max == null ? d : Math.min(d, max);
        const kmInSlab = Math.max(0, upper - min);
        if (kmInSlab > 0) {
            earning += kmInSlab * perKm;
        }
    }
    return Math.round(earning);
}

async function repair() {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('Connected to DB');

        const rules = await FoodDeliveryCommissionRule.find({ status: true }).lean();
        
        const orders = await FoodOrder.find({
            orderStatus: 'delivered'
        }).populate('restaurantId').lean();

        console.log('Total Delivered Orders:', orders.length);

        for (const order of orders) {
            const updateFields = {};

            if (order.riderEarning === 0) {
                const restaurant = order.restaurantId;
                const deliveryLoc = order.deliveryAddress?.location?.coordinates || order.address?.location?.coordinates;
                if (restaurant?.location?.coordinates?.length === 2 && deliveryLoc?.length === 2) {
                    const d = haversineKm(restaurant.location.coordinates[1], restaurant.location.coordinates[0], deliveryLoc[1], deliveryLoc[0]);
                    const earning = await getRiderEarning(d, rules);
                    if (earning > 0) updateFields.riderEarning = earning;
                }
            }

            if (!order.deliveryState?.deliveredAt) {
                const historyEntry = order.statusHistory?.find(h => h.to === 'delivered');
                updateFields['deliveryState.deliveredAt'] = historyEntry?.at || order.updatedAt || new Date();
                updateFields['deliveryState.currentPhase'] = 'delivered';
                updateFields['deliveryState.status'] = 'delivered';
            }

            if (Object.keys(updateFields).length > 0) {
                await FoodOrder.updateOne({ _id: order._id }, { $set: updateFields });
                console.log(`Repaired order ${order.order_id}:`, updateFields);
            }
        }

        console.log('Repair complete');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

repair();
