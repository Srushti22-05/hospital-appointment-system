import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;

if (!uri) {
  console.error("MongoDB connection string .env mein nahi mili. Variable ka naam check karo.");
  process.exit(1);
}

await mongoose.connect(uri);

const result = await User.updateMany(
  { role: "doctor", approvalStatus: { $exists: false } },
  { $set: { approvalStatus: "approved" } }
);

console.log("Matched:", result.matchedCount, "Updated:", result.modifiedCount);
await mongoose.disconnect();