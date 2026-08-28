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
    console.log('PipraPay Tables:', JSON.stringify(tables));

    for (const t of tables) {
      const name = Object.values(t)[0];
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \`${name}\` LIMIT 10`);
        console.log(`=== PipraPay Table ${name} ===`, JSON.stringify(rows, null, 2));
      } catch (e) {
        console.log(`Error querying ${name}:`, e.message);
      }
    }
  } catch (err) {
    console.error('PipraPay DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
