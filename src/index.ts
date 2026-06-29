import "dotenv/config";
import app from "./app";
import { connectDB, disconnectDB } from "./config/database";

const PORT = process.env.PORT ?? 5000;

async function bootstrap() {
  try {
    await connectDB();
    console.log("MongoDB Atlas connected");

    app.listen(PORT, () => {
      console.log(`HireHub API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await disconnectDB();
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

bootstrap();
