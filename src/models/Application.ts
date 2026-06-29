import mongoose, { Schema, model, models } from "mongoose";
import { ApplicationStatuses } from "./types";

const applicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: String,
    status: { type: String, enum: ApplicationStatuses, default: "PENDING", index: true },
  },
  { timestamps: true, versionKey: false }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.set("toJSON", { virtuals: true });
applicationSchema.set("toObject", { virtuals: true });

export default (models.Application as mongoose.Model<any>) ||
  model("Application", applicationSchema);
