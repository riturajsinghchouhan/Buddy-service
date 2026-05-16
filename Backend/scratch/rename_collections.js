import mongoose from 'mongoose';

const uri = "mongodb+srv://playeronline4076_db_user:3e6Kc6Ikodz6vXGs@cluster0.yau7gwg.mongodb.net/Quick_commerce?retryWrites=true&w=majority&appName=Cluster0";

const collectionsToRename = [
  "categories", "hubinwards", "experiencesections", "hubinventories", "checkoutgroups",
  "purchaserequests", "searchindexfailures", "sellermetrics", "notificationpreferences",
  "paymentwebhookevents", "pickuppartners", "wallets", "faqs", "settings", "deliveries",
  "orders", "ledgerentries", "notifications", "stockhistories", "offers", "reviews",
  "carts", "orderotps", "financereports", "coupons", "mapmetrics", "offersections",
  "deliveryassignments", "otpverifications", "mediametadatas", "tickets", "admins",
  "transactions", "heroconfigs", "sellers", "otpsessions", "pushtokens", "dashboardstats",
  "financeauditlogs", "products", "users", "wishlists", "payouts", "payments", "geocodecaches"
];

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    console.log("Renaming collections...");
    
    for (const coll of collectionsToRename) {
      const target = `quick_${coll}`;
      try {
        // Check if source exists
        const list = await db.listCollections({ name: coll }).toArray();
        if (list.length > 0) {
          // Check if target already exists (don't overwrite)
          const targetList = await db.listCollections({ name: target }).toArray();
          if (targetList.length === 0) {
            await db.collection(coll).rename(target);
            console.log(` ✅ Renamed ${coll} -> ${target}`);
          } else {
            console.log(` ⏩ Skipped ${coll} (target ${target} already exists)`);
          }
        } else {
          console.log(` ❓ Skipped ${coll} (source doesn't exist)`);
        }
      } catch (err) {
        console.error(` ❌ Error renaming ${coll}:`, err.message);
      }
    }
    
    console.log("Renaming complete.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
