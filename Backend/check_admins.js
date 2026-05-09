
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodAdmin } from './src/core/admin/admin.model.js';

dotenv.config();

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const admins = await FoodAdmin.find({}, 'email');
        console.log('Existing Admins:');
        admins.forEach(admin => console.log(`- ${admin.email}`));
        if (admins.length === 0) {
            console.log('No admins found in database.');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkAdmins();
