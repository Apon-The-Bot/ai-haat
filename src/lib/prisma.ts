import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat";

  // Sanitize raw hash character in password which breaks URI parsing
  if (url.includes("Rhythm#Aihaatdb01")) {
    url = url.replace("Rhythm#Aihaatdb01", "Rhythm%23Aihaatdb01");
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
