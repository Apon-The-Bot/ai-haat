const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, status: true, visibility: true }
  });
  console.log("Product statuses and visibilities:");
  const statusCounts = {};
  const visibilityCounts = {};
  products.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    visibilityCounts[p.visibility] = (visibilityCounts[p.visibility] || 0) + 1;
  });
  console.log("Statuses:", statusCounts);
  console.log("Visibilities:", visibilityCounts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
