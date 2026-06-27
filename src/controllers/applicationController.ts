// ============================================================
// src/controllers/applicationController.ts
// Application Controller — Candidate apply, track, newsletter
// ============================================================

import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

// POST /api/jobs/:id/apply
export const applyToJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 5: parse multipart form, save resume URL, create Application
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 5" });
};

// GET /api/applications/my
export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 5
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 5" });
};

// POST /api/newsletter/subscribe
export const subscribeNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 5
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 5" });
};
