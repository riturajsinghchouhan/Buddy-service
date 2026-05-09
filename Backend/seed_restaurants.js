
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodRestaurant } from './src/modules/food/restaurant/models/restaurant.model.js';

dotenv.config();

const restaurantsToSeed = [
  {
    restaurantName: "The Green Kitchen",
    ownerName: "Amit Sharma",
    ownerEmail: "amit@greenkitchen.com",
    ownerPhone: "9876543210",
    pureVegRestaurant: true,
    addressLine1: "123, Green Avenue",
    area: "Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452010",
    cuisines: ["North Indian", "Chinese"],
    openingTime: "11:00 AM",
    closingTime: "11:00 PM",
    openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    isAcceptingOrders: true,
    estimatedDeliveryTime: "25-30 min",
    rating: 4.5,
    totalRatings: 120,
    zoneId: new mongoose.Types.ObjectId("69f5e9f49960886ca448b82f"),
    status: "approved",
    profileImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coverImages: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    location: {
      type: "Point",
      coordinates: [75.8975, 22.7533],
      city: "Indore",
      state: "Madhya Pradesh"
    }
  },
  {
    restaurantName: "Royal Biryani House",
    ownerName: "Mohammad Ali",
    ownerEmail: "ali@royalbiryani.com",
    ownerPhone: "9876543211",
    pureVegRestaurant: false,
    addressLine1: "45, Palace Road",
    area: "Bhanwarkuan",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452001",
    cuisines: ["Mughlai", "Biryani"],
    openingTime: "12:00 PM",
    closingTime: "12:00 AM",
    openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    isAcceptingOrders: true,
    estimatedDeliveryTime: "35-40 min",
    rating: 4.2,
    totalRatings: 350,
    zoneId: new mongoose.Types.ObjectId("69f5e9f49960886ca448b82f"),
    status: "approved",
    profileImage: "https://images.unsplash.com/photo-1563379091339-03b11ea620c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coverImages: ["https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    location: {
      type: "Point",
      coordinates: [75.8675, 22.6833],
      city: "Indore",
      state: "Madhya Pradesh"
    }
  },
  {
    restaurantName: "Healthy Bowls",
    ownerName: "Sanya Gupta",
    ownerEmail: "sanya@healthybowls.com",
    ownerPhone: "9876543212",
    pureVegRestaurant: true,
    addressLine1: "Shop 12, Wellness Plaza",
    area: "Old Palasia",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452018",
    cuisines: ["Salads", "Healthy Food", "Juices"],
    openingTime: "08:00 AM",
    closingTime: "09:00 PM",
    openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    isAcceptingOrders: true,
    estimatedDeliveryTime: "20-25 min",
    rating: 4.8,
    totalRatings: 85,
    zoneId: new mongoose.Types.ObjectId("69f5e9f49960886ca448b82f"),
    status: "approved",
    profileImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coverImages: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    location: {
      type: "Point",
      coordinates: [75.8875, 22.7233],
      city: "Indore",
      state: "Madhya Pradesh"
    }
  },
  {
    restaurantName: "Spicy Tandoor",
    ownerName: "Rajesh Singh",
    ownerEmail: "rajesh@spicytandoor.com",
    ownerPhone: "9876543213",
    pureVegRestaurant: false,
    addressLine1: "A-5, Food Court",
    area: "Rajwada",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452002",
    cuisines: ["North Indian", "Tandoori"],
    openingTime: "01:00 PM",
    closingTime: "11:30 PM",
    openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    isAcceptingOrders: true,
    estimatedDeliveryTime: "30-35 min",
    rating: 4.0,
    totalRatings: 210,
    zoneId: new mongoose.Types.ObjectId("69f5e9f49960886ca448b82f"),
    status: "approved",
    profileImage: "https://images.unsplash.com/photo-1589187151003-0dd3b8ad14e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coverImages: ["https://images.unsplash.com/photo-1601050633647-8f8f2f3ee01c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    location: {
      type: "Point",
      coordinates: [75.8575, 22.7133],
      city: "Indore",
      state: "Madhya Pradesh"
    }
  },
  {
    restaurantName: "Indore Chaat Corner",
    ownerName: "Vikas Namdev",
    ownerEmail: "vikas@chaatcorner.com",
    ownerPhone: "9876543214",
    pureVegRestaurant: true,
    addressLine1: "Sarafa Market",
    area: "Sarafa",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452002",
    cuisines: ["Street Food", "Indore Special"],
    openingTime: "06:00 PM",
    closingTime: "02:00 AM",
    openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    isAcceptingOrders: true,
    estimatedDeliveryTime: "15-20 min",
    rating: 4.7,
    totalRatings: 1200,
    zoneId: new mongoose.Types.ObjectId("69f5e9f49960886ca448b82f"),
    status: "approved",
    profileImage: "https://images.unsplash.com/photo-1601050648497-3f9eba95b58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coverImages: ["https://images.unsplash.com/photo-1606491956689-2ea8c5369511?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
    location: {
      type: "Point",
      coordinates: [75.8575, 22.7133],
      city: "Indore",
      state: "Madhya Pradesh"
    }
  }
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodelo');
    
    console.log("Seeding restaurants...");
    for (const rest of restaurantsToSeed) {
      // Check if already exists by name
      const existing = await FoodRestaurant.findOne({ restaurantName: rest.restaurantName });
      if (existing) {
        console.log(`Skipping existing restaurant: ${rest.restaurantName}`);
        continue;
      }
      
      const newRest = new FoodRestaurant(rest);
      await newRest.save();
      console.log(`Added: ${rest.restaurantName}`);
    }
    
    console.log("Seeding completed successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
