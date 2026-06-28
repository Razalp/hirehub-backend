// ============================================================
// src/app.ts
// Express Application — middleware pipeline + routes
// ============================================================

import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { errorHandler } from "./middlewares/errorMiddleware";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

const app: Application = express();

// ── CORS ────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static files (uploaded resumes) ─────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ── Swagger UI ──────────────────────────────────────────────
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── API Routes ──────────────────────────────────────────────
app.use("/api", router);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

export default app;
