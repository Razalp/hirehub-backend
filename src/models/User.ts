import mongoose, { Schema, model, models } from "mongoose";
import { Roles } from "./types";

const profileSchema = new Schema(
  {
    phone: String,
    resumeUrl: String,
    skills: { type: [String], default: [] },
    experienceLevel: String,
    currentSalary: String,
    preferredLocation: String,
    jobType: String,
    isRemoteOnly: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: Roles, default: "CANDIDATE", index: true },
    profile: { type: profileSchema, default: undefined },
  },
  { timestamps: true, versionKey: false }
);

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default (models.User as mongoose.Model<any>) || model("User", userSchema);
