import "dotenv/config";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js"

const app = express();

app.use(express.json());
app.use(mongoSanitize());

connectDB();

// Auth routes 
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});