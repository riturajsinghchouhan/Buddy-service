
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodAdmin } from './src/core/admin/admin.model.js';

dotenv.config();

const createAdmin = async () => {
    const email = 'admin@foodelo.com';
    const password = 'adminpassword'; // User can change this later

    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        
        const existing = await FoodAdmin.findOne({ email });
        if (existing) {
            console.log(`Admin with email ${email} already exists.`);
        } else {
            const admin = new FoodAdmin({
                email,
                password,
                name: 'System Admin',
                role: 'ADMIN',
                isActive: true,
                servicesAccess: ['food', 'quickCommerce', 'taxi']
            });
            await admin.save();
            console.log(`Admin created successfully!`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

createAdmin();
