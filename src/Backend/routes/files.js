import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getUploadUrl,
  confirmUpload,
  getDownloadUrl,
  listFiles,
  deleteFile,
} from "../controllers/fileController.js";

const router = Router();

router.get("/", protect, listFiles);
router.post("/upload-url", protect, getUploadUrl);
router.post("/", protect, confirmUpload);
router.get("/:id/download", protect, getDownloadUrl);
router.delete("/:id", protect, deleteFile);

export default router;