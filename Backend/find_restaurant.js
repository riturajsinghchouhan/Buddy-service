
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodRestaurant } from './src/modules/food/restaurant/models/restaurant.model.js';

dotenv.config();

async function findOne() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodelo');
    const restaurant = await FoodRestaurant.findOne().lean();
    console.log(JSON.stringify(restaurant, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findOne();
