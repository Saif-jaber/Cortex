import mongoose from "mongoose"
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

// Cache the connection promise so repeated serverless invocations reuse it.
let connPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!connPromise) {
    connPromise = init().catch((err) => {
      // Allow a retry on the next invocation instead of caching the failure.
      connPromise = null;
      throw err;
    });
  }
  return connPromise;
}

async function init() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const chatsCol = mongoose.connection.collection("chats");
    const indexes = await chatsCol.indexes();
    const hasUniqueOwner = indexes.some((idx) => idx.key.owner === 1 && idx.unique);
    if (hasUniqueOwner) {
      await chatsCol.dropIndex("owner_1");
      console.log("Dropped old unique index on chats.owner");
    }

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Never process.exit() on Vercel — it would brick the warm instance.
    throw err;
  }
}

export default connectDB;
