import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createError } from "../middlewares/errorMiddleware";

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

const serializeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  ...(user.profile && { profile: user.profile }),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      throw createError("Name, email, and password are required.", 400);
    }

    if (password.length < 8) {
      throw createError("Password must be at least 8 characters long.", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw createError("Email address is already registered.", 400);
    }

    // isAdmin flag (default false) allows seeding admin accounts via Swagger or API
    const role = isAdmin === true ? "ADMIN" : "CANDIDATE";

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      profile: {
        skills: [],
        isRemoteOnly: false,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: `Account registered successfully as ${role}.`,
      accessToken,
      refreshToken,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

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

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw createError("Invalid email or password.", 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

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

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
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
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

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

    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET ?? "hirehub-refresh-jwt-secret-key-2026"
      );
    } catch {
      throw createError("Invalid or expired refresh token.", 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError("User not found.", 404);
    }

    res.json({
      success: true,
      accessToken: generateAccessToken(user.id, user.role),
      refreshToken: generateRefreshToken(user.id, user.role),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError("Not authenticated.", 401);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw createError("User not found.", 404);
    }

    res.json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};
