import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
}

async function approve() {
    await mongoose.connect(MONGO_URI);
    const Food = mongoose.model('Food', new mongoose.Schema({}, { strict: false }), 'food_items');
    const result = await Food.updateMany(
        { approvalStatus: 'pending' },
        { $set: { approvalStatus: 'approved', approvedAt: new Date() } }
    );
    console.log(`Successfully approved ${result.modifiedCount} items in the database!`);
    await mongoose.disconnect();
}

approve().catch(console.error);
