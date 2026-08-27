const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'mysql://u298980084_pakna_user:Rk%23PaknaPay%402026%21Db@srv1497.hstgr.io:3306/u298980084_paknapay' } }
});

async function run() {
  const rows = await prisma.$queryRawUnsafe('SELECT id, ref, status, brand_id, amount, created_date FROM pp_transaction ORDER BY id DESC LIMIT 5');
  console.log('Latest transactions:', rows);
  await prisma.$disconnect();
}
run();
