import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName:{
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // enforce the same rules as the frontend
      validate: {
        validator: (p) =>
          p.length >= 15 &&
          /[A-Z]/.test(p) &&
          /[a-z]/.test(p) &&
          /\d/.test(p) &&
          /[^A-Za-z0-9]/.test(p),
        message:
          "Password must be 15+ chars with uppercase, lowercase, number, and symbol",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);