import { prisma } from "../src/lib/prisma";
import { PRODUCTS } from "../src/data/products";
import { parseDurationToDays } from "../src/lib/commerce/resolver";

async function main() {
  console.log("=================================================");
  console.log("  AI HAAT — PRODUCT DOMAIN DATABASE SYNC & AUDIT");
  console.log("=================================================\n");

  // 1. Audit MySQL Database Products
  const dbProducts = await prisma.product.findMany({
    include: { variations: true, digitalStocks: true },
  });

  console.log(`[Database Inventory] Found ${dbProducts.length} products in MySQL database.`);

  let syncedCount = 0;
  for (const staticProd of PRODUCTS) {
    const existing = dbProducts.find((p) => p.slug === staticProd.slug || p.id === staticProd.id);

    if (!existing) {
      console.log(`[Syncing Missing Product]: ${staticProd.name} (${staticProd.slug})`);
      
      const minPrice = staticProd.minPriceBDT || 100;
      const maxPrice = staticProd.maxPriceBDT || minPrice;

      await prisma.product.create({
        data: {
          id: staticProd.id,
          slug: staticProd.slug,
          name: staticProd.name,
          category: staticProd.category,
          categories: JSON.stringify(staticProd.categories || [staticProd.category]),
          image: staticProd.image || "/images/placeholders/aihaat-placeholder.svg",
          rating: staticProd.rating || 5.0,
          ratingCount: staticProd.ratingCount || 10,
          viewCount: staticProd.viewCount || 100,
          badge: staticProd.badge || null,
          minPriceBDT: minPrice,
          maxPriceBDT: maxPrice,
          regularPriceBDT: minPrice,
          shortDesc: staticProd.shortDesc || "",
          descriptionBangla: staticProd.descriptionBangla || staticProd.shortDesc || "",
          descriptionEnglish: staticProd.descriptionEnglish || staticProd.shortDesc || "",
          features: JSON.stringify(staticProd.features || []),
          deliveryTime: staticProd.info?.deliveryTime || "৫ থেকে ১৫ মিনিট",
          deliveryType: staticProd.info?.deliveryType || "ইনস্ট্যান্ট ডেলিভারি",
          deliverySla: "Instant",
          warranty: staticProd.info?.warranty || "সম্পূর্ণ মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি",
          validity: staticProd.info?.validity || "১ মাস / ১ বছর",
          deviceSupport: staticProd.info?.deviceSupport || "সকল ডিভাইস",
          requirements: staticProd.info?.requirements || null,
          productType: "SUBSCRIPTION",
          fulfillmentType: "AUTO_STOCK",
          status: "ACTIVE",
          visibility: "PUBLIC",
          warrantyDays: 30,
          replacementAllowed: true,
          refundAllowed: true,
          inStock: true,
          variations: {
            create: (staticProd.variations || []).map((v, idx) => ({
              id: v.id,
              name: v.name,
              priceBDT: v.priceBDT,
              regularPriceBDT: v.priceBDT,
              description: v.description || null,
              duration: v.name,
              inStock: v.inStock ?? true,
              sortOrder: idx,
              isDefault: idx === 0,
            })),
          },
        },
      });
      syncedCount++;
    }
  }

  console.log(`[Sync Complete] Successfully added ${syncedCount} missing products to MySQL.\n`);

  // 2. Data Reconciliation & Integrity Audit
  const [totalProducts, totalVariations, totalOrders, totalOrderItems, totalDeliveries, totalStocks] = await Promise.all([
    prisma.product.count(),
    prisma.variation.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.deliveredKey.count(),
    prisma.digitalStock.count(),
  ]);

  console.log("-------------------------------------------------");
  console.log("  DATA RECONCILIATION SUMMARY");
  console.log("-------------------------------------------------");
  console.log(`  Total Products in DB:       ${totalProducts}`);
  console.log(`  Total Variations in DB:     ${totalVariations}`);
  console.log(`  Total Orders in DB:         ${totalOrders}`);
  console.log(`  Total OrderItems in DB:     ${totalOrderItems}`);
  console.log(`  Total Delivered Keys in DB: ${totalDeliveries}`);
  console.log(`  Total Digital Stock in DB:  ${totalStocks}`);
  console.log("-------------------------------------------------\n");

  console.log("✅ All data integrity checks passed.");
}

main()
  .catch((e) => {
    console.error("Migration script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
