// ============================================================
// src/config/prisma.ts
// Prisma Client Singleton — prevents multiple instances in dev
// ============================================================

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient({ log: ["query", "error"] });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
