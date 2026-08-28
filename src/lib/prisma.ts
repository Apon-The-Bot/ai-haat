import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || "";

  // If URL is empty, truncated at '#' comment, or missing host
  if (
    !url ||
    url === "mysql://u298980084_ai_haat_db:Rhythm" ||
    !url.includes("@") ||
    (!url.includes("@srv1497.hstgr.io") && !url.includes("@localhost") && !url.includes("@127.0.0.1"))
  ) {
    return "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat?connection_limit=10&pool_timeout=20";
  }

  // Sanitize username missing _db
  if (url.includes("u298980084_ai_haat:") && !url.includes("u298980084_ai_haat_db:")) {
    url = url.replace("u298980084_ai_haat:", "u298980084_ai_haat_db:");
  }

  // Sanitize raw hash character in password which breaks URI parsing
  if (url.includes("Rhythm#Aihaatdb01")) {
    url = url.replace("Rhythm#Aihaatdb01", "Rhythm%23Aihaatdb01");
  }

  return url;
}

const sanitizedUrl = getDatabaseUrl();
process.env.DATABASE_URL = sanitizedUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: sanitizedUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
