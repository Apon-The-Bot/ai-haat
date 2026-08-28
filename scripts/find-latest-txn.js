const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "" } }
});

async function run() {
  const rows = await prisma.$queryRawUnsafe('SELECT id, ref, status, brand_id, amount, created_date FROM pp_transaction ORDER BY id DESC LIMIT 5');
  console.log('Latest transactions:', rows);
  await prisma.$disconnect();
}
run();
