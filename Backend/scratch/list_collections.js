import mongoose from 'mongoose';

const uri = "mongodb+srv://playeronline4076_db_user:3e6Kc6Ikodz6vXGs@cluster0.yau7gwg.mongodb.net/Quick_commerce?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in Quick_commerce:");
    collections.forEach(c => console.log(` - ${c.name}`));
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
