// ============================================================
// src/routes/jobRoutes.ts
// Job Routes — public listings and candidate actions with file uploads
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
import upload from "../config/multer";

const router = Router();

// Public routes
router.get("/", getAllJobs);
router.get("/featured", getFeaturedJobs);
router.get("/categories", getCategoryCounts);
router.get("/:id", getJobDetails);

// Protected — candidates
router.post("/:id/apply", protect, upload.single("resume"), applyToJob);
router.post("/:id/bookmark", protect, toggleBookmark);
router.delete("/:id/bookmark", protect, toggleBookmark);

export default router;
