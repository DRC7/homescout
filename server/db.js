import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("Missing MONGODB_URI in .env");

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
}
