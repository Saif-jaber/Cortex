import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listProviders, getAiConfig, saveAiConfig, deleteAiConfig } from "../controllers/aiController.js";

const router = Router();

router.get("/providers", protect, listProviders);
router.get("/config", protect, getAiConfig);
router.put("/config", protect, saveAiConfig);
router.delete("/config", protect, deleteAiConfig);

export default router;
