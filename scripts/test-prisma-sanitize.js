function sanitizeDbUrl(rawUrl) {
  let url = rawUrl || "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat";
  if (url.includes("u298980084_ai_haat:") && !url.includes("u298980084_ai_haat_db:")) {
    url = url.replace("u298980084_ai_haat:", "u298980084_ai_haat_db:");
  }
  if (url.includes("Rhythm#Aihaatdb01")) {
    url = url.replace("Rhythm#Aihaatdb01", "Rhythm%23Aihaatdb01");
  }
  return url;
}

const badUrl = "mysql://u298980084_ai_haat:Rhythm#Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat?connection_limit=10&pool_timeout=20";
const fixed = sanitizeDbUrl(badUrl);
console.log("Original:", badUrl);
console.log("Sanitized:", fixed);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: fixed }
  }
});

async function run() {
  const count = await prisma.product.count();
  console.log("✓ Prisma successfully connected! Product count:", count);
}

run().catch(console.error).finally(() => prisma.$disconnect());
