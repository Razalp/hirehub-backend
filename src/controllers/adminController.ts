import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Application, Bookmark, Company, Job, User } from "../models";
import { createError } from "../middlewares/errorMiddleware";
import { ApplicationStatus, JobStatus, JobType, RemoteOption } from "../models/types";

const regex = (value: string) => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const formatJobStatus = (status: string) =>
  status === "ACTIVE" ? "Active" : status === "DRAFT" ? "Draft" : "Closed";

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalJobs, activeJobs, totalUsers, totalApplications] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ role: "CANDIDATE" }),
      Application.countDocuments(),
    ]);

    const categoryCounts = await Job.aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const latestApps = await Application.find()
      .populate("jobId")
      .sort({ createdAt: -1 })
      .limit(5);

    const [recentJobs, recentSignups, recentAccepted] = await Promise.all([
      Job.find().populate("companyId").sort({ createdAt: -1 }).limit(2),
      User.find({ role: "CANDIDATE" }).sort({ createdAt: -1 }).limit(2),
      Application.find({ status: "ACCEPTED" }).populate("jobId").sort({ updatedAt: -1 }).limit(1),
    ]);

    const recentActivity: any[] = [];
    recentJobs.forEach((job: any) => {
      recentActivity.push({
        type: "JOB_POSTED",
        description: `${job.companyId.name} - ${job.title}`,
        timeAgo: "2m ago",
        createdAt: job.createdAt,
      });
    });

    recentSignups.forEach((user: any) => {
      recentActivity.push({
        type: "USER_SIGNUP",
        description: `${user.name} joined`,
        timeAgo: "3h ago",
        createdAt: user.createdAt,
      });
    });

    recentAccepted.forEach((application: any) => {
      recentActivity.push({
        type: "APPLICATION_ACCEPTED",
        description: `${application.name} -> ${application.jobId.title}`,
        timeAgo: "1h ago",
        createdAt: application.updatedAt,
      });
    });

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
      jobsByCategory: categoryCounts.map((item) => ({ category: item._id, value: item.value })),
      recentActivity: recentActivity.slice(0, 4),
      latestApplications: latestApps.map((application: any) => ({
        id: application.id,
        name: application.name,
        job: application.jobId?.title ?? "Deleted job",
        status: application.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const buildAdminJobFilter = async (query: Request["query"]) => {
  const search = query.search as string | undefined;
  const category = query.category as string | undefined;
  const experience = query.experience as string | undefined;
  const filter: any = {};

  if (search) {
    const matchingCompanies = await Company.find({ name: regex(search) }).select("_id");
    filter.$or = [
      { title: regex(search) },
      { companyId: { $in: matchingCompanies.map((company: any) => company._id) } },
    ];
  }

  if (category && category !== "All") filter.category = regex(category);
  if (experience && experience !== "All") filter.experience = regex(experience);

  return filter;
};

export const getAdminJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pageNum = parseInt((req.query.page as string) || "1") || 1;
    const limitNum = parseInt((req.query.limit as string) || "10") || 10;
    const skip = (pageNum - 1) * limitNum;
    const filter = await buildAdminJobFilter(req.query);

    const [jobs, totalCount] = await Promise.all([
      Job.find(filter).populate("companyId").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    const formattedJobs = await Promise.all(
      jobs.map(async (job: any) => ({
        id: job.id,
        title: job.title,
        company: job.companyId.name,
        companyInitial: job.companyId.initial,
        companyColor: job.companyId.color,
        category: job.category,
        experience: job.experience,
        salary: job.salary,
        status: formatJobStatus(job.status),
        applicants: await Application.countDocuments({ jobId: job._id }),
        posted: "Just now",
      }))
    );

    res.json({ success: true, count: totalCount, jobs: formattedJobs });
  } catch (error) {
    next(error);
  }
};

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
      featured,
    } = req.body;

    const admin = await User.findOne({ role: "ADMIN" });
    if (!admin) throw createError("No administrative user registered to assign post owner.", 500);
    if (!companyName || !title || !category || !description) {
      throw createError("Company name, job title, category, and description are required.", 400);
    }

    const company = await Company.findOneAndUpdate(
      { name: companyName },
      {
        $setOnInsert: {
          name: companyName,
          initial: companyName.slice(0, 2).toUpperCase(),
          color: "from-slate-700 to-slate-900",
        },
      },
      { new: true, upsert: true }
    );

    const job = await Job.create({
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
      featured: Boolean(featured),
      companyId: company.id,
      postedById: admin.id,
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

export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError("Job posting not found.", 404);

    const existingJob = await Job.findById(id);
    if (!existingJob) throw createError("Job posting not found.", 404);

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.companyId;
    delete updateData.postedById;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.companyName) {
      const company = await Company.findOneAndUpdate(
        { name: updateData.companyName },
        {
          $setOnInsert: {
            name: updateData.companyName,
            initial: updateData.companyName.slice(0, 2).toUpperCase(),
            color: "from-slate-700 to-slate-900",
          },
        },
        { new: true, upsert: true }
      );
      updateData.companyId = company.id;
      delete updateData.companyName;
    }

    await Job.findByIdAndUpdate(id, updateData, { runValidators: true });

    res.json({ success: true, message: "Job listing updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError("Job posting not found.", 404);

    const existingJob = await Job.findById(id);
    if (!existingJob) throw createError("Job posting not found.", 404);

    await Promise.all([
      Job.deleteOne({ _id: id }),
      Application.deleteMany({ jobId: id }),
      Bookmark.deleteMany({ jobId: id }),
    ]);

    res.json({ success: true, message: "Job listing and associated applications deleted." });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const pageNum = parseInt((req.query.page as string) || "1") || 1;
    const limitNum = parseInt((req.query.limit as string) || "10") || 10;
    const skip = (pageNum - 1) * limitNum;
    const filter: any = {};

    if (search) {
      const matchingJobs = await Job.find({ title: regex(search) }).select("_id");
      filter.$or = [
        { name: regex(search) },
        { email: regex(search) },
        { jobId: { $in: matchingJobs.map((job: any) => job._id) } },
      ];
    }

    if (req.query.jobId) {
      const jobId = String(req.query.jobId);
      if (!mongoose.Types.ObjectId.isValid(jobId)) throw createError("Job posting not found.", 404);
      filter.jobId = jobId;
    }

    if (status) filter.status = status as ApplicationStatus;

    const [apps, totalCount] = await Promise.all([
      Application.find(filter).populate("jobId").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Application.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: totalCount,
      applications: apps.map((application: any) => ({
        id: application.id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        job: application.jobId?.title ?? "Deleted job",
        resumeUrl: application.resumeUrl,
        status: application.status,
        date: application.createdAt,
        createdAt: application.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status) throw createError("Status parameter is required.", 400);
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError("Application not found.", 404);

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

    const app = await Application.findById(id);
    if (!app) throw createError("Application not found.", 404);

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status: targetStatus },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Application status updated to ${targetStatus}.`,
      application: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// ── USER MANAGEMENT ────────────────────────────────────────────

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const pageNum = parseInt((req.query.page as string) || "1") || 1;
    const limitNum = parseInt((req.query.limit as string) || "10") || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (search) {
      filter.$or = [{ name: regex(search) }, { email: regex(search) }];
    }
    if (role && role !== "ALL") filter.role = role;

    const [users, totalCount] = await Promise.all([
      User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: totalCount,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isAdmin: u.role === "ADMIN",
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      throw createError("Name, email, and password are required.", 400);
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) throw createError("A user with this email already exists.", 409);

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(String(password), 12);

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: isAdmin ? "ADMIN" : "CANDIDATE",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: { id: user.id, name: user.get("name"), email: user.get("email"), role: user.get("role") },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError("User not found.", 404);

    const user = await User.findById(id);
    if (!user) throw createError("User not found.", 404);

    const { name, email, isAdmin, password } = req.body;
    const updateData: any = {};

    if (name) updateData.name = String(name).trim();
    if (email) {
      const normalized = String(email).toLowerCase().trim();
      const conflict = await User.findOne({ email: normalized, _id: { $ne: id } });
      if (conflict) throw createError("Email is already in use by another account.", 409);
      updateData.email = normalized;
    }
    if (typeof isAdmin === "boolean") {
      updateData.role = isAdmin ? "ADMIN" : "CANDIDATE";
    }
    if (password) {
      const bcrypt = await import("bcryptjs");
      updateData.passwordHash = await bcrypt.hash(String(password), 12);
    }

    await User.findByIdAndUpdate(id, updateData, { runValidators: true });

    res.json({ success: true, message: "User updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) throw createError("User not found.", 404);

    const user = await User.findById(id);
    if (!user) throw createError("User not found.", 404);

    await Promise.all([
      User.deleteOne({ _id: id }),
      Application.deleteMany({ candidateId: id }),
      Bookmark.deleteMany({ userId: id }),
    ]);

    res.json({ success: true, message: "User and associated data deleted." });
  } catch (error) {
    next(error);
  }
};


