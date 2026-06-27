// ============================================================
// src/controllers/authController.ts
// Auth Controller — Register, Login, AdminLogin, GetMe
// ============================================================

import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

// POST /api/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 3: hash password, create User + Profile, return JWT
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 3" });
};

// POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 3: verify email/password, return JWT
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 3" });
};

// POST /api/admin/auth/login
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 3: verify credentials, check role === ADMIN, return JWT
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 3" });
};

// GET /api/auth/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — STEP 3: return req.user data with profile
  res.status(501).json({ success: false, error: "Not yet implemented — STEP 3" });
};
