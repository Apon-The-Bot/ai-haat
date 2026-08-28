const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || ""
    }
  }
});

async function seedProducts() {
  const content = fs.readFileSync(path.join(__dirname, '../src/data/products.ts'), 'utf8');
  const startMarker = 'export const PRODUCTS: Product[] = ';
  const endMarker = 'export function getProductBySlug';
  
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error("Markers not found");
    return;
  }

  const arrayStr = content.slice(startIdx + startMarker.length, endIdx).trim();
  const cleanArrayStr = arrayStr.replace(/;\s*$/, '');

  let PRODUCTS;
  try {
    PRODUCTS = eval(cleanArrayStr);
  } catch (e) {
    console.error("Eval error:", e);
    return;
  }

  console.log(`Extracted ${PRODUCTS.length} products. Seeding into MySQL...`);

  for (const p of PRODUCTS) {
    try {
      const existing = await prisma.product.findUnique({
        where: { slug: p.slug },
      });

      if (!existing) {
        await prisma.product.create({
          data: {
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: p.category,
            categories: JSON.stringify(p.categories || [p.category]),
            image: p.image,
            rating: p.rating || 5.0,
            ratingCount: p.ratingCount || 1,
            viewCount: p.viewCount || 100,
            badge: p.badge || null,
            minPriceBDT: p.minPriceBDT,
            maxPriceBDT: p.maxPriceBDT,
            shortDesc: p.shortDesc || "",
            descriptionBangla: p.descriptionBangla || "",
            descriptionEnglish: p.descriptionEnglish || "",
            features: JSON.stringify(p.features || []),
            deliveryTime: p.info?.deliveryTime || "5 to 15 mins",
            deliveryType: p.info?.deliveryType || "Email & Digital Vault Dispatch",
            warranty: p.info?.warranty || "Full Warranty",
            validity: p.info?.validity || "1 Month",
            deviceSupport: p.info?.deviceSupport || "All Devices",
            inStock: p.inStock ?? true,
            isFeatured: p.isFeatured ?? false,
            isBestProduct: p.isBestProduct ?? false,
            isBestSelling: p.isBestSelling ?? false,
            variations: {
              create: (p.variations || []).map(v => ({
                id: v.id,
                name: v.name,
                priceBDT: v.priceBDT,
                description: v.description || "",
                inStock: v.inStock ?? true,
              }))
            }
          }
        });
        console.log(`✓ Seeded to MySQL: ${p.name}`);
      } else {
        console.log(`- Already in MySQL: ${p.name}`);
      }
    } catch (err) {
      console.error(`Error saving ${p.name}:`, err.message);
    }
  }

  const count = await prisma.product.count();
  console.log(`\n✓ Total products now in MySQL database: ${count}`);
  await prisma.$disconnect();
}

seedProducts().catch(console.error);
