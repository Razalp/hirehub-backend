// ============================================================
// src/controllers/applicationController.ts
// Application Controller — Candidate application submissions & newsletters
// ============================================================

import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createError } from "../middlewares/errorMiddleware";

// ── POST /api/jobs/:id/apply ────────────────────────────────
export const applyToJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.id;
    const { name, email, phone, coverLetter, useProfileResume } = req.body;

    if (!userId) {
      throw createError("User authentication context missing.", 401);
    }

    if (!name || !email || !phone) {
      throw createError("Applicant name, email, and phone number are required.", 400);
    }

    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw createError("Job posting not found.", 404);
    }

    // Check if duplicate application
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: userId,
        },
      },
    });

    if (existingApplication) {
      throw createError("You have already applied for this job listing.", 400);
    }

    let resumeUrl = "";

    if (useProfileResume === "true" || useProfileResume === true) {
      // Find candidate profile
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile || !profile.resumeUrl) {
        throw createError("No resume found in your profile. Please upload a file.", 400);
      }
      resumeUrl = profile.resumeUrl;
    } else {
      // Verify file upload
      if (!req.file) {
        throw createError("Resume file is required.", 400);
      }
      // Create static path link
      resumeUrl = `/uploads/${req.file.filename}`;

      // Update candidate profile dynamically with new resume and phone if empty
      await prisma.profile.update({
        where: { userId },
        data: {
          resumeUrl,
          phone: phone as string,
        },
      });
    }

    // Save Application record
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: userId,
        name: name as string,
        email: email as string,
        phone: phone as string,
        resumeUrl,
        coverLetter: coverLetter as string,
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/applications/my ────────────────────────────────
export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createError("Authentication required.", 401);
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                initial: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = applications.map((a: any) => ({
      id: a.id,
      status: a.status === "PENDING" ? "Pending" : a.status === "REVIEWED" ? "Reviewed" : a.status === "ACCEPTED" ? "Accepted" : "Rejected",
      date: "Just now", // Fallback text
      createdAt: a.createdAt,
      job: {
        id: a.job.id,
        title: a.job.title,
        location: a.job.location,
        salary: a.job.salary,
        company: a.job.company.name,
        companyInitial: a.job.company.initial,
        companyColor: a.job.company.color,
      },
    }));

    res.json({
      success: true,
      applications: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/newsletter/subscribe ──────────────────────────
export const subscribeNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError("Email is required.", 400);
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      throw createError("Email is already subscribed.", 400);
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    });

    res.json({
      success: true,
      message: "Subscribed successfully! Check your inbox for weekly curations.",
    });
  } catch (error) {
    next(error);
  }
};
