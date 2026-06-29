import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Application, Bookmark, Company, Job } from "../models";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createError } from "../middlewares/errorMiddleware";
import { JobType } from "../models/types";

const regex = (value: string) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

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

const formatType = (type: string) =>
  type === "FULL_TIME" ? "Full Time" : type === "PART_TIME" ? "Part Time" : type === "CONTRACT" ? "Contract" : "Internship";

const formatRemote = (remote: string) =>
  remote === "REMOTE" ? "Remote" : remote === "HYBRID" ? "Hybrid" : "On-site";

const formatJob = async (job: any) => {
  const applicants = await Application.countDocuments({ jobId: job._id });
  const company = job.companyId;

  return {
    id: job.id,
    title: job.title,
    company: company.name,
    companyInitial: company.initial,
    companyColor: company.color,
    location: job.location,
    experience: job.experience,
    salary: job.salary,
    type: formatType(job.type),
    remote: formatRemote(job.remote),
    skills: job.skills,
    category: job.category,
    posted: "Just now",
    featured: job.featured,
    applicants,
  };
};

const buildPublicJobFilter = async (query: Request["query"]) => {
  const search = query.search as string | undefined;
  const category = query.category as string | undefined;
  const experience = query.experience as string | undefined;
  const location = query.location as string | undefined;
  const type = query.type as string | undefined;
  const remoteOnly = query.remoteOnly as string | undefined;

  const filter: any = { status: "ACTIVE" };

  if (search) {
    const matchingCompanies = await Company.find({ name: regex(search) }).select("_id");
    filter.$or = [
      { title: regex(search) },
      { category: regex(search) },
      { location: regex(search) },
      { skills: regex(search) },
      { companyId: { $in: matchingCompanies.map((company: any) => company._id) } },
    ];
  }

  if (category && category !== "All") filter.category = regex(category);
  if (experience && experience !== "All") filter.experience = regex(experience);
  if (location) filter.location = regex(location);
  if (type) filter.type = { $in: type.split(",") as JobType[] };
  if (remoteOnly === "true") filter.remote = "REMOTE";

  return filter;
};

export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sort = req.query.sort as string | undefined;
    const pageNum = parseInt((req.query.page as string) || "1") || 1;
    const limitNum = parseInt((req.query.limit as string) || "10") || 10;
    const skip = (pageNum - 1) * limitNum;
    const filter = await buildPublicJobFilter(req.query);

    const [jobs, totalCount] = await Promise.all([
      Job.find(filter).populate("companyId").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    let formattedJobs = await Promise.all(jobs.map(formatJob));
    if (sort === "popular") {
      formattedJobs = formattedJobs.sort((a, b) => b.applicants - a.applicants);
    }

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

export const getFeaturedJobs = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await Job.find({ featured: true, status: "ACTIVE" })
      .populate("companyId")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      jobs: await Promise.all(jobs.map(formatJob)),
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryCounts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Job.aggregate([
      { $match: { status: "ACTIVE" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      categories: categories.map((category) => ({
        name: category._id,
        count: category.count,
        icon: getCategoryIcon(category._id),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getJobDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError("Job posting not found.", 404);
    }

    const job = await Job.findById(id).populate("companyId");
    if (!job) {
      throw createError("Job posting not found.", 404);
    }

    const baseJob = await formatJob(job);
    const related = await Job.find({
      category: job.category,
      status: "ACTIVE",
      _id: { $ne: job._id },
    })
      .populate("companyId")
      .limit(3);

    const company = job.companyId as any;
    res.json({
      success: true,
      job: {
        ...baseJob,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        benefits: job.benefits,
        companyProfile: {
          industry: company.industry,
          size: company.size,
          website: company.website,
        },
      },
      relatedJobs: await Promise.all(related.map(formatJob)),
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) throw createError("Authentication required.", 401);
    if (!mongoose.Types.ObjectId.isValid(jobId)) throw createError("Job not found.", 404);

    const job = await Job.findById(jobId);
    if (!job) throw createError("Job not found.", 404);

    const bookmark = await Bookmark.findOne({ userId, jobId });

    if (req.method === "DELETE" || bookmark) {
      if (bookmark) await Bookmark.deleteOne({ _id: bookmark._id });
      res.json({
        success: true,
        message: "Bookmark removed successfully.",
        isBookmarked: false,
      });
      return;
    }

    await Bookmark.create({ userId, jobId });
    res.json({
      success: true,
      message: "Job bookmarked successfully.",
      isBookmarked: true,
    });
  } catch (error) {
    next(error);
  }
};
