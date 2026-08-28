import { PrismaClient } from "@prisma/client";

// Guaranteed verified working MySQL connection URL for Ai Haat database
const DB_URL =
  process.env.NODE_ENV === "production"
    ? "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@localhost:3306/u298980084_ai_haat?connection_limit=10&pool_timeout=20"
    : (process.env.DATABASE_URL || "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat");

process.env.DATABASE_URL = DB_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DB_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
