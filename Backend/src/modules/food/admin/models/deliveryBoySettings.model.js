import mongoose from 'mongoose';

const salarySlabSchema = new mongoose.Schema(
    {
        orderCount: { type: Number, required: true, min: 0 },
        salaryAmount: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const deliveryBoySettingsSchema = new mongoose.Schema(
    {
        adminCommissionPercentage: { type: Number, default: 0, min: 0, max: 100 },
        weeklySalarySlabs: { type: [salarySlabSchema], default: [] },
        monthlySalarySlabs: { type: [salarySlabSchema], default: [] },
        // Multi-Restaurant Order Settings
        multiOrderEnabled: { type: Boolean, default: false },
        multiOrderMaxDistance: { type: Number, default: 3, min: 0 }, // max km between R1 and R2
        multiOrderAdditionalCharge: { type: Number, default: 0, min: 0 }, // extra fee for 2nd pickup
        // Order Sharing Settings
        splitOrderEnabled: { type: Boolean, default: true },
        splitOrderThreshold: { type: Number, default: 20, min: 1 },
        isActive: { type: Boolean, default: true }
    },
    { collection: 'food_delivery_boy_settings', timestamps: true }
);

export const FoodDeliveryBoySettings = mongoose.model('FoodDeliveryBoySettings', deliveryBoySettingsSchema);
