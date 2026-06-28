// ============================================================
// src/routes/authRoutes.ts
// Auth Routes — login, register, refresh, and getMe
// ============================================================

import { Router } from "express";
import { register, login, adminLogin, refresh, getMe } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected — any logged-in user
router.get("/me", protect, getMe);

export default router;
