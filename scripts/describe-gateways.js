const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://u298980084_pakna_user:Rk%23PaknaPay%402026%21Db@srv1497.hstgr.io:3306/u298980084_paknapay'
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
