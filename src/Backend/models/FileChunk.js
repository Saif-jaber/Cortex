import mongoose from "mongoose";

const fileChunkSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    // Which embedding produced this vector ("openai:text-embedding-3-small",
    // "ollama:nomic-embed-text", ...) or "keyword" when stored unembedded.
    embeddingModel: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

fileChunkSchema.index({ owner: 1, file: 1 });

export default mongoose.model("FileChunk", fileChunkSchema);
