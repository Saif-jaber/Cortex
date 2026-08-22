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
    ai: {
      provider: { type: String, default: "" },
      apiKeyEnc: { type: String, default: "" }, // encrypted at rest
      apiKeyHint: { type: String, default: "" }, // masked tail, e.g. ••••x4F2
      baseUrl: { type: String, default: "" }, // for local/custom endpoints
      model: { type: String, default: "" },
      verifiedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);