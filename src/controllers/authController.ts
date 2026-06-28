// ============================================================
// src/controllers/authController.ts
// Auth Controller — Register, Login, AdminLogin, Refresh, GetMe
// ============================================================

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createError } from "../middlewares/errorMiddleware";

// Token Helpers
const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET ?? "hirehub-access-jwt-secret-key-2026",
    { expiresIn: "15d" }
  );
};

const generateRefreshToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET ?? "hirehub-refresh-jwt-secret-key-2026",
    { expiresIn: "30d" }
  );
};

// ── POST /api/auth/register ────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createError("Name, email, and password are required.", 400);
    }

    if (password.length < 8) {
      throw createError("Password must be at least 8 characters long.", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw createError("Email address is already registered.", 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and profile transactionally
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CANDIDATE",
        profile: {
          create: {
            skills: [],
            isRemoteOnly: false,
          },
        },
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ───────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError("Email and password are required.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw createError("Invalid email or password.", 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/admin/auth/login ──────────────────────────────
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError("Email and password are required.", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw createError("Invalid email or password.", 401);
    }

    if (user.role !== "ADMIN") {
      throw createError("Access denied. Insufficient administrative privileges.", 403);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/refresh ──────────────────────────────────
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError("Refresh token is required.", 400);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET ?? "hirehub-refresh-jwt-secret-key-2026"
      );
    } catch (err) {
      throw createError("Invalid or expired refresh token.", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw createError("User not found.", 404);
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.role);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ───────────────────────────────────────
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError("Not authenticated.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    if (!user) {
      throw createError("User not found.", 404);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
