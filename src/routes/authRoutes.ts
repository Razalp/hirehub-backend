// ============================================================
// src/routes/authRoutes.ts
// ============================================================

import { Router } from "express";
import { register, login, adminLogin, getMe } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected — any logged-in user
router.get("/me", protect, getMe);

export default router;
