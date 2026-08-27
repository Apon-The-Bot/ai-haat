const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://u298980084_pakna_user:Rk%23PaknaPay%402026%21Db@srv1497.hstgr.io:3306/u298980084_paknapay'
    }
  }
});

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('All PipraPay Tables:', tableNames);

    for (const name of tableNames) {
      if (name.includes('brand') || name.includes('admin') || name.includes('key') || name.includes('api')) {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \`${name}\``);
        console.log(`Table ${name}:`, JSON.stringify(rows, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
