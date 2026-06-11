import mongoose from "mongoose";

// Verbindt met MongoDB via de URI uit .env.
// Gooit bij falen een error zodat server.js de app netjes kan afsluiten.
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI ontbreekt in .env");
  }

  await mongoose.connect(uri);
  console.log("✅ Verbonden met MongoDB");
}
