const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "" } }
});

async function run() {
  const orders = await prisma.order.findMany({ include: { items: true, deliveredKeys: true } });
  console.log('Current DB Orders count:', orders.length);
  console.log('Orders:', JSON.stringify(orders, null, 2));
  await prisma.$disconnect();
}
run().catch(console.error);
