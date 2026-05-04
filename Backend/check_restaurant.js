import mongoose from 'mongoose';
import { FoodRestaurant } from './src/modules/food/restaurant/models/restaurant.model.js';
import { config } from './src/config/env.js';

async function checkRestaurant() {
    try {
        await mongoose.connect(config.mongodbUri);
        const res = await FoodRestaurant.findById('69f60f273ef1cb1bf7991b4e').lean();
        console.log('Restaurant Details:', JSON.stringify(res, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkRestaurant();
