// ============================================================
// src/controllers/jobController.ts
// Job Controller — Public routes for job listings
// ============================================================

import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

// GET /api/jobs
// Supports: search, category, experience, location, type, remoteOnly, sort, page, limit
export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 4
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 4" });
};

// GET /api/jobs/featured
export const getFeaturedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 4
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 4" });
};

// GET /api/jobs/categories
export const getCategoryCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 4
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 4" });
};

// GET /api/jobs/:id
export const getJobDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 4
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 4" });
};

// POST /api/jobs/:id/bookmark  |  DELETE /api/jobs/:id/bookmark
export const toggleBookmark = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 4
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 4" });
};
