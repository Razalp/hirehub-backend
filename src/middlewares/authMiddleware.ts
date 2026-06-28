// ============================================================
// src/middlewares/authMiddleware.ts
// JWT Protection & Role-Based Access Control Implementation
// ============================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { createError } from "./errorMiddleware";

// Extend Express Request to carry the authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ── protect ────────────────────────────────────────────────
// Validates access token and attaches req.user
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw createError("Authentication token is missing. Please log in.", 401);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ?? "hirehub-access-jwt-secret-key-2026"
      );
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw createError("Authentication token expired. Please refresh token.", 401);
      }
      throw createError("Invalid token. Please authenticate.", 401);
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw createError("The user belonging to this token no longer exists.", 401);
    }

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// ── restrictTo ─────────────────────────────────────────────
// Usage: router.use(restrictTo("ADMIN"))
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw createError("Authentication context missing.", 500);
      }

      if (!roles.includes(req.user.role)) {
        throw createError("Access denied. Insufficient permissions.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
