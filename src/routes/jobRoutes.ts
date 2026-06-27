// ============================================================
// src/routes/jobRoutes.ts
// ============================================================

import { Router } from "express";
import {
  getAllJobs,
  getFeaturedJobs,
  getCategoryCounts,
  getJobDetails,
  toggleBookmark,
} from "../controllers/jobController";
import { applyToJob } from "../controllers/applicationController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllJobs);
router.get("/featured", getFeaturedJobs);
router.get("/categories", getCategoryCounts);
router.get("/:id", getJobDetails);

// Protected — candidates
router.post("/:id/apply", protect, applyToJob);
router.post("/:id/bookmark", protect, toggleBookmark);
router.delete("/:id/bookmark", protect, toggleBookmark);

export default router;
