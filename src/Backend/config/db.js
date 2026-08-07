import mongoose from "mongoose"
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

export default connectDB;