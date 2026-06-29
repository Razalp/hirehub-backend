import mongoose, { Schema, model, models } from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

bookmarkSchema.index({ userId: 1, jobId: 1 }, { unique: true });
bookmarkSchema.set("toJSON", { virtuals: true });
bookmarkSchema.set("toObject", { virtuals: true });

export default (models.Bookmark as mongoose.Model<any>) || model("Bookmark", bookmarkSchema);
