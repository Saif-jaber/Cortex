import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileKey: {
      type: String,
      required: true,
      unique: true, // R2 object key, must never repeat
    },
    fileType: {
      type: String, // mime type e.g. "application/pdf"
    },
    fileSize: {
      type: Number, // bytes
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);