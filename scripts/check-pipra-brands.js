const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || ""
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
