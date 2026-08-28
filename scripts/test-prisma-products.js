const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat?connection_limit=10&pool_timeout=20" }
  }
});

async function main() {
  const where = {};
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: 0,
      take: 100,
      orderBy: { sortOrder: 'asc' },
      include: {
        variations: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  console.log("Total products fetched:", total, products.length);
  const formatted = products.map((p) => {
    let featuresList = [];
    try {
      featuresList = JSON.parse(p.features || "[]");
    } catch {
      featuresList = [];
    }

    let categoriesList = [];
    try {
      categoriesList = JSON.parse(p.categories || "[]");
    } catch {
      categoriesList = [p.category];
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      categories: categoriesList,
      image: p.image,
      badge: p.badge || (p.isBestProduct ? "Best Product" : undefined),
      minPriceBDT: p.minPriceBDT,
      maxPriceBDT: p.maxPriceBDT,
      regularPriceBDT: p.regularPriceBDT || p.minPriceBDT,
      salePriceBDT: p.salePriceBDT || undefined,
      shortDesc: p.shortDesc,
      rating: p.rating,
      ratingCount: p.ratingCount,
      viewCount: p.viewCount,
      inStock: p.inStock,
      isFeatured: p.isFeatured,
      isBestProduct: p.isBestProduct,
      isBestSelling: p.isBestSelling,
      productType: p.productType,
      fulfillmentType: p.fulfillmentType,
      deliveryTime: p.deliveryTime,
      deliveryType: p.deliveryType,
      deliverySla: p.deliverySla,
      features: featuresList,
      variations: p.variations.map((v) => ({
        id: v.id,
        name: v.name,
        priceBDT: v.priceBDT,
        regularPriceBDT: v.regularPriceBDT || v.priceBDT,
        salePriceBDT: v.salePriceBDT || undefined,
        duration: v.duration,
        inStock: v.inStock,
        description: v.description,
      })),
    };
  });

  console.log("Formatted count:", formatted.length);
  console.log("Sample 1:", formatted[0].name, formatted[0].category, formatted[0].minPriceBDT);
}

main().catch(console.error).finally(() => prisma.$disconnect());
