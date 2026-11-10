const { PrismaClient } = require("@prisma/client");

async function run() {
  const url = new URL(process.env.DATABASE_URL || "");
  if (url.protocol !== "mysql:" || url.hash || !url.username || !url.password) {
    throw new Error("Invalid MySQL configuration");
  }
  const prisma = new PrismaClient();
  try {
    const count = await prisma.product.count();
    console.log("Database connection verified. Product count:", count);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch(() => {
  console.error("Database configuration or connectivity check failed");
  process.exitCode = 1;
});
