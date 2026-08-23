import "dotenv/config";
import express from "express";
import cors from "cors";
import { sanitize } from "express-mongo-sanitize";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import folderRoutes from "./routes/folder.js";
import filesRoutes from "./routes/files.js";
import chatRoutes from "./routes/chat.js";
import aiRoutes from "./routes/ai.js";

const app = express();

export default app;

app.use(cors());
app.use(express.json());

// express-mongo-sanitize's bundled middleware reassigns req.query, which is
// getter-only in Express 5 and throws. Its sanitize() helper mutates in place,
// so we call that directly on each request object.
app.use((req, res, next) => {
  ["body", "params", "headers", "query"].forEach((key) => {
    if (req[key]) sanitize(req[key]);
  });
  next();
});

// On Vercel the app runs as a serverless function (api/index.js), so we only
// listen when started directly (local dev). A failed connection must not
// become an unhandled rejection (that would crash the serverless instance);
// mongoose buffers queries until the connection succeeds.
connectDB().catch((err) => {
  console.error("Initial MongoDB connection failed:", err.message);
});

// Health check for verifying the function boots on Vercel
app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState });
});

// Auth routes
app.use("/api/auth", authRoutes);
// Folder routes
app.use("/api/folders", folderRoutes);
// File routes
app.use("/api/files", filesRoutes);
// Chat routes
app.use("/api/chat", chatRoutes);
// AI provider config routes
app.use("/api/ai", aiRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}