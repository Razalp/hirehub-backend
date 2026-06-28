// ============================================================
// src/controllers/adminController.ts
// Admin Controller — Analytics, Job CRUD, Screening Workflows
// ============================================================

import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { createError } from "../middlewares/errorMiddleware";
import { JobStatus, JobType, RemoteOption, ApplicationStatus } from "@prisma/client";

// ── GET /api/admin/dashboard/stats ──────────────────────────
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalJobs, activeJobs, totalUsers, totalApplications] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.application.count(),
    ]);

    // Aggregate category distribution
    const categoryCounts = await prisma.job.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    const jobsByCategory = categoryCounts.map((c) => ({
      category: c.category,
      value: c._count.id,
    }));

    // Fetch latest applications
    const latestApps = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        job: true,
      },
    });

    const latestApplications = latestApps.map((a) => ({
      id: a.id,
      name: a.name,
      job: a.job.title,
      status: a.status === "PENDING" ? "Pending" : a.status === "REVIEWED" ? "Reviewed" : a.status === "ACCEPTED" ? "Accepted" : "Rejected",
    }));

    // Get recent signup & activity logs dynamically
    const [recentJobs, recentSignups, recentAccepted] = await Promise.all([
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 2,
        include: { company: true },
      }),
      prisma.user.findMany({
        where: { role: "CANDIDATE" },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      prisma.application.findMany({
        where: { status: "ACCEPTED" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { job: true },
      }),
    ]);

    const recentActivity: any[] = [];
    recentJobs.forEach((job: any) => {
      recentActivity.push({
        type: "JOB_POSTED",
        description: `${job.company.name} · ${job.title}`,
        timeAgo: "2m ago",
        createdAt: job.createdAt,
      });
    });

    recentSignups.forEach((user) => {
      recentActivity.push({
        type: "USER_SIGNUP",
        description: `${user.name} joined`,
        timeAgo: "3h ago",
        createdAt: user.createdAt,
      });
    });

    recentAccepted.forEach((app: any) => {
      recentActivity.push({
        type: "APPLICATION_ACCEPTED",
        description: `${app.name} → ${app.job.title}`,
        timeAgo: "1h ago",
        createdAt: app.updatedAt,
      });
    });

    // Sort combined activities by date
    recentActivity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      success: true,
      metrics: {
        totalJobs,
        activeJobs,
        totalUsers,
        totalApplications,
        changes: {
          totalJobs: "+12%",
          activeJobs: "+8%",
          totalUsers: "+22%",
          totalApplications: "+34%",
        },
      },
      weeklyTrend: [
        { day: "Mon", value: 120 },
        { day: "Tue", value: 180 },
        { day: "Wed", value: 150 },
        { day: "Thu", value: 220 },
        { day: "Fri", value: 280 },
        { day: "Sat", value: 210 },
        { day: "Sun", value: 320 },
      ],
      jobsByCategory,
      recentActivity: recentActivity.slice(0, 4),
      latestApplications,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/admin/jobs ─────────────────────────────────────
export const getAdminJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const experience = req.query.experience as string | undefined;
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;

    const pageNum = parseInt(page || "1") || 1;
    const limitNum = parseInt(limit || "10") || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (experience && experience !== "All") {
      where.experience = { equals: experience, mode: "insensitive" };
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: true,
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    const formattedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      companyInitial: job.company.initial,
      companyColor: job.company.color,
      category: job.category,
      experience: job.experience,
      salary: job.salary,
      status: job.status === "ACTIVE" ? "Active" : job.status === "DRAFT" ? "Draft" : "Closed",
      applicants: job._count.applications,
      posted: "Just now",
    }));

    res.json({
      success: true,
      count: totalCount,
      jobs: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/admin/jobs ────────────────────────────────────
export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      companyName,
      title,
      category,
      experience,
      salary,
      location,
      type,
      remote,
      skills,
      description,
      requirements,
      responsibilities,
      benefits,
      status,
    } = req.body;

    // Hardcoded creator ID for seed safety
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      throw createError("No administrative user registered to assign post owner.", 500);
    }

    if (!companyName || !title || !category || !description) {
      throw createError("Company name, job title, category, and description are required.", 400);
    }

    // Find or create Company record
    const company = await prisma.company.upsert({
      where: { name: companyName },
      update: {},
      create: {
        name: companyName,
        initial: companyName.slice(0, 2).toUpperCase(),
        color: "from-slate-700 to-slate-900", // Default gradient fallback
      },
    });

    const job = await prisma.job.create({
      data: {
        title,
        category,
        experience: (experience as string) ?? "1-3 Years",
        salary: (salary as string) ?? "Not disclosed",
        location: (location as string) ?? "Remote",
        type: (type as JobType) ?? "FULL_TIME",
        remote: (remote as RemoteOption) ?? "REMOTE",
        skills: (skills as string[]) ?? [],
        description,
        requirements: (requirements as string[]) ?? [],
        responsibilities: (responsibilities as string[]) ?? [],
        benefits: (benefits as string[]) ?? [],
        status: (status as JobStatus) ?? "DRAFT",
        companyId: company.id,
        postedById: admin.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Job listing created successfully.",
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/admin/jobs/:id ─────────────────────────────────
export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;

    // Verify job exists
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw createError("Job posting not found.", 404);
    }

    // Strip readonly relations
    delete updateData.id;
    delete updateData.companyId;
    delete updateData.postedById;
    delete updateData.createdAt;

    await prisma.job.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Job listing updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/admin/jobs/:id ──────────────────────────────
export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw createError("Job posting not found.", 404);
    }

    await prisma.job.delete({ where: { id } });

    res.json({
      success: true,
      message: "Job listing and associated applications deleted.",
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/admin/applications ─────────────────────────────
export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;

    const pageNum = parseInt(page || "1") || 1;
    const limitNum = parseInt(limit || "10") || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { job: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status as ApplicationStatus;
    }

    const [apps, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where }),
    ]);

    const formatted = apps.map((a: any) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      job: a.job.title,
      resumeUrl: a.resumeUrl,
      status: a.status === "PENDING" ? "Pending" : a.status === "REVIEWED" ? "Reviewed" : a.status === "ACCEPTED" ? "Accepted" : "Rejected",
      date: "Just now",
    }));

    res.json({
      success: true,
      count: totalCount,
      applications: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/admin/applications/:id/status ────────────────
export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      throw createError("Status parameter is required.", 400);
    }

    // Map string values to Database Enum
    const enumMap: Record<string, ApplicationStatus> = {
      Pending: "PENDING",
      Reviewed: "REVIEWED",
      Accepted: "ACCEPTED",
      Rejected: "REJECTED",
      PENDING: "PENDING",
      REVIEWED: "REVIEWED",
      ACCEPTED: "ACCEPTED",
      REJECTED: "REJECTED",
    };

    const targetStatus = enumMap[status];

    if (!targetStatus) {
      throw createError("Invalid status value. Must be Pending, Reviewed, Accepted, or Rejected.", 400);
    }

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      throw createError("Application not found.", 404);
    }

    await prisma.application.update({
      where: { id },
      data: { status: targetStatus },
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};
