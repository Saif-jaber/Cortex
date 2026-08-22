import { Router } from "express";
import { signup, login, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/profile", protect, updateProfile);

export default router;