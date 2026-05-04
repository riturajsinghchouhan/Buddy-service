import mongoose from 'mongoose';
import { FoodDeliveryCommissionRule } from './src/modules/food/admin/models/deliveryCommissionRule.model.js';
import { config } from './src/config/env.js';

async function checkRules() {
    try {
        const uri = config.mongodbUri;
        if (!uri) throw new Error('MONGO_URI is missing in config');
        
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        const rules = await FoodDeliveryCommissionRule.find({});
        console.log('Commission Rules Found:', rules.length);
        console.log('Rules:', JSON.stringify(rules, null, 2));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

checkRules();
