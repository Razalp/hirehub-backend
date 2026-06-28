// ============================================================
// src/controllers/jobController.ts
// Job Controller — Public queries, search filters, details, bookmarks
// ============================================================

import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createError } from "../middlewares/errorMiddleware";
import { JobType, RemoteOption } from "@prisma/client";

// Map frontend category names to icons
const getCategoryIcon = (category: string): string => {
  const map: Record<string, string> = {
    Frontend: "Layout",
    Backend: "Server",
    "Full Stack": "Layers",
    DevOps: "Cloud",
    "AI & ML": "Brain",
    "AI/ML": "Brain",
    Mobile: "Smartphone",
    Design: "Layout",
  };
  return map[category] ?? "Briefcase";
};

// ── GET /api/jobs ──────────────────────────────────────────
export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const experience = req.query.experience as string | undefined;
    const location = req.query.location as string | undefined;
    const type = req.query.type as string | undefined;
    const remoteOnly = req.query.remoteOnly as string | undefined;
    const sort = req.query.sort as string | undefined;
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;

    const pageNum = parseInt(page || "1") || 1;
    const limitNum = parseInt(limit || "10") || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query filters
    const where: any = {
      status: "ACTIVE", // Public listings only
    };

    // Full text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
        { skills: { hasSome: [search] } },
      ];
    }

    // Category filter
    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    // Experience filter
    if (experience && experience !== "All") {
      where.experience = { equals: experience, mode: "insensitive" };
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    // Job Type filter (e.g. FULL_TIME, CONTRACT)
    if (type) {
      const types = type.split(",") as JobType[];
      where.type = { in: types };
    }

    // Remote option filter
    if (remoteOnly === "true") {
      where.remote = "REMOTE";
    }

    // Sort order definition
    let orderBy: any = { createdAt: "desc" }; // default latest
    if (sort === "popular") {
      orderBy = {
        applications: {
          _count: "desc",
        },
      };
    }

    // Run queries
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              initial: true,
              color: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    // Format output to match mock database expectations
    const formattedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      companyInitial: job.company.initial,
      companyColor: job.company.color,
      location: job.location,
      experience: job.experience,
      salary: job.salary,
      type: job.type === "FULL_TIME" ? "Full Time" : job.type === "PART_TIME" ? "Part Time" : job.type === "CONTRACT" ? "Contract" : "Internship",
      remote: job.remote === "REMOTE" ? "Remote" : job.remote === "HYBRID" ? "Hybrid" : "On-site",
      skills: job.skills,
      category: job.category,
      posted: "Just now", // Friendly fallback
      featured: job.featured,
      applicants: job._count.applications,
    }));

    res.json({
      success: true,
      count: totalCount,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
      },
      jobs: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/jobs/featured ──────────────────────────────────
export const getFeaturedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        featured: true,
        status: "ACTIVE",
      },
      include: {
        company: {
          select: {
            name: true,
            initial: true,
            color: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const formattedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      companyInitial: job.company.initial,
      companyColor: job.company.color,
      location: job.location,
      experience: job.experience,
      salary: job.salary,
      type: job.type === "FULL_TIME" ? "Full Time" : job.type === "PART_TIME" ? "Part Time" : job.type === "CONTRACT" ? "Contract" : "Internship",
      remote: job.remote === "REMOTE" ? "Remote" : job.remote === "HYBRID" ? "Hybrid" : "On-site",
      skills: job.skills,
      category: job.category,
      featured: job.featured,
      applicants: job._count.applications,
    }));

    res.json({
      success: true,
      jobs: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/jobs/categories ────────────────────────────────
export const getCategoryCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.job.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: {
        id: true,
      },
    });

    const formatted = categories.map((c) => ({
      name: c.category,
      count: c._count.id,
      icon: getCategoryIcon(c.category),
    }));

    res.json({
      success: true,
      categories: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/jobs/:id ───────────────────────────────────────
export const getJobDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw createError("Job posting not found.", 404);
    }

    const jobAny = job as any;

    // Get related jobs in the same category
    const related = await prisma.job.findMany({
      where: {
        category: jobAny.category,
        status: "ACTIVE",
        id: { not: id },
      },
      include: {
        company: {
          select: {
            name: true,
            initial: true,
            color: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      take: 3,
    });

    const formattedJob = {
      id: jobAny.id,
      title: jobAny.title,
      company: jobAny.company.name,
      companyInitial: jobAny.company.initial,
      companyColor: jobAny.company.color,
      location: jobAny.location,
      experience: jobAny.experience,
      salary: jobAny.salary,
      type: jobAny.type === "FULL_TIME" ? "Full Time" : jobAny.type === "PART_TIME" ? "Part Time" : jobAny.type === "CONTRACT" ? "Contract" : "Internship",
      remote: jobAny.remote === "REMOTE" ? "Remote" : jobAny.remote === "HYBRID" ? "Hybrid" : "On-site",
      skills: jobAny.skills,
      category: jobAny.category,
      description: jobAny.description,
      requirements: jobAny.requirements,
      responsibilities: jobAny.responsibilities,
      benefits: jobAny.benefits,
      applicants: jobAny._count.applications,
      companyProfile: {
        industry: jobAny.company.industry,
        size: jobAny.company.size,
        website: jobAny.company.website,
      },
    };

    const formattedRelated = related.map((r: any) => ({
      id: r.id,
      title: r.title,
      company: r.company.name,
      companyInitial: r.company.initial,
      companyColor: r.company.color,
      location: r.location,
      experience: r.experience,
      salary: r.salary,
      type: r.type === "FULL_TIME" ? "Full Time" : r.type === "PART_TIME" ? "Part Time" : r.type === "CONTRACT" ? "Contract" : "Internship",
      remote: r.remote === "REMOTE" ? "Remote" : r.remote === "HYBRID" ? "Hybrid" : "On-site",
      skills: r.skills,
      category: r.category,
      applicants: r._count.applications,
    }));

    res.json({
      success: true,
      job: formattedJob,
      relatedJobs: formattedRelated,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST/DELETE /api/jobs/:id/bookmark ──────────────────────
export const toggleBookmark = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      throw createError("Authentication required.", 401);
    }

    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw createError("Job not found.", 404);
    }

    // Check if bookmarked
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: { userId, jobId },
      },
    });

    if (req.method === "DELETE" || bookmark) {
      if (bookmark) {
        await prisma.bookmark.delete({
          where: { id: bookmark.id },
        });
      }
      res.json({
        success: true,
        message: "Bookmark removed successfully.",
        isBookmarked: false,
      });
      return;
    }

    // Otherwise, bookmark it
    await prisma.bookmark.create({
      data: {
        userId,
        jobId,
      },
    });

    res.json({
      success: true,
      message: "Job bookmarked successfully.",
      isBookmarked: true,
    });
  } catch (error) {
    next(error);
  }
};
