import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { chat, listChats, getChat, createChat, deleteChat } from "../controllers/chatController.js";

const router = Router();

router.get("/", protect, listChats);
router.post("/", protect, chat);
router.post("/new", protect, createChat);
router.get("/:id", protect, getChat);
router.delete("/:id", protect, deleteChat);

export default router;
