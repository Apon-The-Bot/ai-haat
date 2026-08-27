const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
    console.log('Tables:', JSON.stringify(tables));

    for (const t of tables) {
      const name = Object.values(t)[0];
      try {
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \`${name}\` LIMIT 5`);
        console.log(`=== Table ${name} ===`, JSON.stringify(rows));
      } catch (e) {
        console.log(`Could not query ${name}:`, e.message);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
