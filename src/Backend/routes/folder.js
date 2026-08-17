import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listFolders, createFolder, deleteFolder } from "../controllers/folderController.js";

const router = Router();

// no need naming path bcuz diffrent routing methods  
router.get("/", protect, listFolders);
router.post("/", protect, createFolder);
router.delete("/:id", protect, deleteFolder);

export default router;