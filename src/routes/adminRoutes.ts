// ============================================================
// src/routes/adminRoutes.ts
// ============================================================

import { Router } from "express";
import {
  getDashboardStats,
  getAdminJobs,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  updateApplicationStatus,
} from "../controllers/adminController";
import { adminLogin } from "../controllers/authController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = Router();

// Admin auth (separate login endpoint)
router.post("/auth/login", adminLogin);

// All routes below this line require ADMIN role
router.use(protect, restrictTo("ADMIN"));

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Job management
router.get("/jobs", getAdminJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);

// Application management
router.get("/applications", getApplications);
router.patch("/applications/:id/status", updateApplicationStatus);

export default router;
