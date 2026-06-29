import mongoose, { Schema, model, models } from "mongoose";
import { JobStatuses, JobTypes, RemoteOptions } from "./types";

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    location: { type: String, default: "Remote" },
    experience: { type: String, default: "1-3 Years" },
    salary: { type: String, default: "Not disclosed" },
    type: { type: String, enum: JobTypes, default: "FULL_TIME" },
    remote: { type: String, enum: RemoteOptions, default: "REMOTE" },
    skills: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    status: { type: String, enum: JobStatuses, default: "DRAFT", index: true },
    featured: { type: Boolean, default: false, index: true },
    postedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

jobSchema.index({ status: 1, category: 1 });
jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });

export default (models.Job as mongoose.Model<any>) || model("Job", jobSchema);
