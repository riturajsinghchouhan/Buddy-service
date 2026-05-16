import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/food_delivery";

async function checkSettings() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");
        
        const settings = await mongoose.connection.db.collection('food_delivery_boy_settings').find({ isActive: true }).toArray();
        console.log("Active Settings:", JSON.stringify(settings, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSettings();
