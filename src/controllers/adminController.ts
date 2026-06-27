// ============================================================
// src/controllers/adminController.ts
// Admin Controller — Dashboard, Jobs CRUD, Applications
// ============================================================

import { Request, Response, NextFunction } from "express";

// GET /api/admin/dashboard/stats
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6: aggregate KPIs, weekly trend, category counts, recent activity
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};

// GET /api/admin/jobs
export const getAdminJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};

// POST /api/admin/jobs
export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};

// PUT /api/admin/jobs/:id
export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};

// DELETE /api/admin/jobs/:id
export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};

// GET /api/admin/applications
export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};

// PATCH /api/admin/applications/:id/status
export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 6
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 6" });
};
