const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log('Total products in MySQL database:', count);
  const products = await prisma.product.findMany({
    include: { variations: true }
  });
  console.log(`Found ${products.length} products in DB.`);
  products.forEach(p => {
    console.log(`- [${p.id}] ${p.name} | Status: ${p.status} | Category: ${p.category} | InStock: ${p.inStock} | Variations: ${p.variations.length}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
