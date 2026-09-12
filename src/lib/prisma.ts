import { PrismaClient } from "@prisma/client";

// DATABASE_URL must be provided via environment variable (.env.local or server config).
// Never hardcode database credentials in source code.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "[FATAL] DATABASE_URL environment variable is not set. " +
    "Please configure it in .env.local (development) or your server environment (production). " +
    "See .env.example for the required format."
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
