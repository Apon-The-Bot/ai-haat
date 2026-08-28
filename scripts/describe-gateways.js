const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || ""
    }
  }
});

async function main() {
  const gCols = await prisma.$queryRawUnsafe('DESCRIBE pp_gateways');
  console.log('pp_gateways columns:', gCols);

  const pCols = await prisma.$queryRawUnsafe('DESCRIBE pp_gateways_parameter');
  console.log('pp_gateways_parameter columns:', pCols);

  await prisma.$disconnect();
}
main().catch(console.error);
