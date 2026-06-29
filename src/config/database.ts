import mongoose from "mongoose";

const mongoUri =
  process.env.MONGODB_URI ??
  process.env.MONGO_URI ??
  process.env.DATABASE_URL;

export const connectDB = async (): Promise<void> => {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Add your MongoDB Atlas connection string to .env.");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB,
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
