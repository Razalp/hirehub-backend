import mongoose, { Schema, model, models } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    initial: { type: String, required: true, maxlength: 2 },
    color: { type: String, required: true },
    industry: { type: String, default: "Technology" },
    size: { type: String, default: "10,000+" },
    website: { type: String, default: "company.com" },
  },
  { timestamps: true, versionKey: false }
);

companySchema.set("toJSON", { virtuals: true });
companySchema.set("toObject", { virtuals: true });

export default (models.Company as mongoose.Model<any>) || model("Company", companySchema);
