import mongoose, { Schema, model, models } from "mongoose";

const newsletterSubscriptionSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

export default (models.NewsletterSubscription as mongoose.Model<any>) ||
  model("NewsletterSubscription", newsletterSubscriptionSchema);
