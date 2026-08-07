import "dotenv/config";
import express from "express";
import { sanitize } from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js"
import folderRoutes from "./routes/folder.js"

const app = express();

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

connectDB();

// Auth routes 
app.use("/api/auth", authRoutes);
// Folder routes
app.use("/api/folders", folderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});