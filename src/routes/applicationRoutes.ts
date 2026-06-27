// ============================================================
// src/routes/applicationRoutes.ts
// ============================================================

import { Router } from "express";
import {
  getMyApplications,
  subscribeNewsletter,
} from "../controllers/applicationController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Protected — candidates tracking their submissions
router.get("/my", protect, getMyApplications);

export default router;
