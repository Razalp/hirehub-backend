// ============================================================
// src/index.ts
// Server Entry Point — loads env, connects DB, starts listening
// ============================================================

import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT ?? 5000;

async function bootstrap() {
  try {
    // Verify PostgreSQL connection
    await prisma.$connect();
    console.log("✅  PostgreSQL connected via Prisma");

    app.listen(PORT, () => {
      console.log(`🚀  HireHub API running at http://localhost:${PORT}`);
      console.log(`📋  Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍  Environment: ${process.env.NODE_ENV ?? "development"}`);
    });
  } catch (error) {
    console.error("❌  Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑  Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
