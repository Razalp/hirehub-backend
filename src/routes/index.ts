// ============================================================
// src/routes/index.ts
// Central Router — mounts all module routers under /api
// ============================================================

import { Router } from "express";
import authRoutes from "./authRoutes";
import jobRoutes from "./jobRoutes";
import applicationRoutes from "./applicationRoutes";
import adminRoutes from "./adminRoutes";
import { subscribeNewsletter } from "../controllers/applicationController";

const router = Router();

// ── Health check ───────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "HireHub API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ── Module routes ──────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/admin", adminRoutes);
router.post("/newsletter/subscribe", subscribeNewsletter);

export default router;
