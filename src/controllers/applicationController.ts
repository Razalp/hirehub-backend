import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Application, Job, NewsletterSubscription, User } from "../models";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createError } from "../middlewares/errorMiddleware";

const formatStatus = (status: string) =>
  status === "PENDING" ? "Pending" : status === "REVIEWED" ? "Reviewed" : status === "ACCEPTED" ? "Accepted" : "Rejected";

export const applyToJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = String(req.params.id);
    const userId = req.user?.id;
    const { name, email, phone, coverLetter, useProfileResume } = req.body;

    if (!userId) throw createError("User authentication context missing.", 401);
    if (!name || !email || !phone) {
      throw createError("Applicant name, email, and phone number are required.", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(jobId)) throw createError("Job posting not found.", 404);

    const job = await Job.findById(jobId);
    if (!job) throw createError("Job posting not found.", 404);

    const existingApplication = await Application.findOne({ jobId, candidateId: userId });
    if (existingApplication) {
      throw createError("You have already applied for this job listing.", 400);
    }

    let resumeUrl = "";

    if (useProfileResume === "true" || useProfileResume === true) {
      const user = await User.findById(userId);
      if (!user?.profile?.resumeUrl) {
        throw createError("No resume found in your profile. Please upload a file.", 400);
      }
      resumeUrl = user.profile.resumeUrl;
    } else {
      if (!req.file) throw createError("Resume file is required.", 400);
      resumeUrl = `/uploads/${req.file.filename}`;
      // Use a single $set to avoid MongoDB conflict on profile.updatedAt
      // (mixing $set and $setOnInsert on the same timestamped subdocument causes a path conflict)
      const user = await User.findById(userId);
      const profileUpdate: Record<string, any> = {
        "profile.resumeUrl": resumeUrl,
        "profile.phone": phone,
      };
      if (!user?.profile?.skills) profileUpdate["profile.skills"] = [];
      if (user?.profile?.isRemoteOnly === undefined) profileUpdate["profile.isRemoteOnly"] = false;
      await User.findByIdAndUpdate(userId, { $set: profileUpdate });
    }

    const application = await Application.create({
      jobId,
      candidateId: userId,
      name,
      email,
      phone,
      resumeUrl,
      coverLetter,
      status: "PENDING",
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

export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw createError("Authentication required.", 401);

    const applications = await Application.find({ candidateId: userId })
      .populate({ path: "jobId", populate: { path: "companyId" } })
      .sort({ createdAt: -1 });

    const formatted = applications.map((application: any) => {
      const job = application.jobId;
      const company = job.companyId;
      return {
        id: application.id,
        status: formatStatus(application.status),
        date: "Just now",
        createdAt: application.createdAt,
        job: {
          id: job.id,
          title: job.title,
          location: job.location,
          salary: job.salary,
          company: company.name,
          companyInitial: company.initial,
          companyColor: company.color,
        },
      };
    });

    res.json({ success: true, applications: formatted });
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw createError("Email is required.", 400);

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await NewsletterSubscription.findOne({ email: normalizedEmail });
    if (existing) throw createError("Email is already subscribed.", 400);

    await NewsletterSubscription.create({ email: normalizedEmail });

    res.json({
      success: true,
      message: "Subscribed successfully! Check your inbox for weekly curations.",
    });
  } catch (error) {
    next(error);
  }
};
