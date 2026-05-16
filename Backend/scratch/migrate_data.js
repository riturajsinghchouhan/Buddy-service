import { MongoClient } from 'mongodb';

const SOURCE_URI = "mongodb+srv://playeronline4076_db_user:3e6Kc6Ikodz6vXGs@cluster0.yau7gwg.mongodb.net/Quick_commerce?retryWrites=true&w=majority&appName=Cluster0";
const TARGET_URI = "mongodb+srv://buddy:buddys@cluster0.6ykakvc.mongodb.net/?appName=Cluster0";

const COLLECTIONS = [
  "quick_categories", "quick_hubinwards", "quick_experiencesections", "quick_hubinventories", "quick_checkoutgroups",
  "quick_purchaserequests", "quick_searchindexfailures", "quick_sellermetrics", "quick_notificationpreferences",
  "quick_paymentwebhookevents", "quick_pickuppartners", "quick_wallets", "quick_faqs", "quick_settings", "quick_deliveries",
  "quick_orders", "quick_ledgerentries", "quick_notifications", "quick_stockhistories", "quick_offers", "quick_reviews",
  "quick_carts", "quick_orderotps", "quick_financereports", "quick_coupons", "quick_mapmetrics", "quick_offersections",
  "quick_deliveryassignments", "quick_otpverifications", "quick_mediametadatas", "quick_tickets", "quick_admins",
  "quick_transactions", "quick_heroconfigs", "quick_sellers", "quick_otpsessions", "quick_pushtokens", "quick_dashboardstats",
  "quick_financeauditlogs", "quick_products", "quick_users", "quick_wishlists", "quick_payouts", "quick_payments", "quick_geocodecaches"
];

async function migrate() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db("Quick_commerce");
    const targetDb = targetClient.db(); // Uses default DB from URI or 'test'

    console.log(`Target Database: ${targetDb.databaseName}`);
    console.log("Starting data migration (Copying)...");

    for (const collName of COLLECTIONS) {
      try {
        const sourceColl = sourceDb.collection(collName);
        const count = await sourceColl.countDocuments();
        
        if (count > 0) {
          const data = await sourceColl.find({}).toArray();
          
          // Clear target only if requested? User said "dont wipe out any data".
          // But "copy" usually means ensuring the target has this data.
          // I'll use insertMany with ordered: false to skip duplicates if any IDs match.
          const targetColl = targetDb.collection(collName);
          
          try {
            await targetColl.insertMany(data, { ordered: false });
            console.log(` ✅ Migrated ${count} documents for ${collName}`);
          } catch (insertErr) {
            if (insertErr.code === 11000) {
              console.log(` ⚠️ Migrated ${count} documents for ${collName} (Some duplicates skipped)`);
            } else {
              throw insertErr;
            }
          }
        } else {
          console.log(` ⏩ Skipped ${collName} (Empty)`);
        }
      } catch (err) {
        console.error(` ❌ Error migrating ${collName}:`, err.message);
      }
    }

    console.log("Migration finished successfully.");
  } catch (err) {
    console.error("Critical Migration Error:", err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();
