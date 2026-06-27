// ============================================================
// src/middlewares/authMiddleware.ts
// JWT Protection & Role-Based Access Control
// ============================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

// Extend Express Request to carry the authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ── protect ────────────────────────────────────────────────
// Validates JWT and attaches req.user on success
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // TODO — implement in STEP 3
  next();
};

// ── restrictTo ─────────────────────────────────────────────
// Usage: router.use(restrictTo("ADMIN"))
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // TODO — implement in STEP 3
    next();
  };
};
