import mongoose from "mongoose";

const folders = new mongoose.Schema(
    {
      folderName: {
        type: String,
        required: true,
        trim: true,
      },
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    }, { timestamps: true}
)

export default mongoose.model("Folder", folders);