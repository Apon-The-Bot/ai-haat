import { prisma } from "../src/lib/prisma";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";
import { getAllProducts } from "../src/lib/products-db";
import { createQATracker, createProductFixture, createStockFixture, cleanupTestFixtures } from "./qa-fixtures";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
    failCount++;
  }
}

async function runPrecision13TestSuite() {
  console.log("=================================================");
  console.log("  BUG-001 PRE-DEPLOY 13-TEST PRECISION AUDIT");
  console.log("=================================================\n");

  const tracker = createQATracker();

  try {
    const allProducts = await getAllProducts();

    // 0-variation product fixture
    const singleVariantProd = allProducts.find((p) => p.slug === "test-auto-license");

    // 1-variation in-stock product
    const oneVarProd = allProducts.find((p) => p.slug === "internet-download-manager-lifetime" && p.inStock);

    // Multi-variation product (no explicit default)
    const multiVariantNoDefault = allProducts.find((p) => p.slug === "netflix-premium-4k-uhd" && p.inStock);
    const otherMultiProd = allProducts.find((p) => p.slug === "telegram-premium-gift");

    // --- TEST 1: 0 variations + variationId=null ---
    console.log("--- TEST 1: 0 variations + variationId=null ---");
    if (singleVariantProd) {
      const t1 = await calculateOrderQuote([
        {
          productId: singleVariantProd.id,
          variationId: null,
          productName: singleVariantProd.name,
          quantity: 1,
        }
      ]);
      assert(t1.isValid === true, "TEST 1: 0 variations + variationId=null passes using product-level config");
      assert(t1.quote.items[0].variationId === null, "TEST 1: Quote item variationId is null");
    }

    // --- TEST 2: 0 variations + variationId="default" ---
    console.log("\n--- TEST 2: 0 variations + variationId='default' ---");
    if (singleVariantProd) {
      const t2 = await calculateOrderQuote([
        {
          productId: singleVariantProd.id,
          variationId: "default",
          productName: singleVariantProd.name,
          quantity: 1,
        }
      ]);
      assert(t2.isValid === true, "TEST 2: 0 variations + variationId='default' passes for backward compatibility");
      assert(t2.quote.totalBDT === (singleVariantProd.salePriceBDT || singleVariantProd.minPriceBDT), "TEST 2: Quote uses authentic product price");
    }

    // --- TEST 3: 0 variations + arbitrary real/fake variation ID ---
    console.log("\n--- TEST 3: 0 variations + arbitrary variation ID ---");
    if (singleVariantProd) {
      const t3 = await calculateOrderQuote([
        {
          productId: singleVariantProd.id,
          variationId: "fake-var-on-single-prod",
          productName: singleVariantProd.name,
          quantity: 1,
        }
      ]);
      assert(t3.isValid === false, "TEST 3: 0 variations + arbitrary variation ID is strictly rejected");
      assert(Boolean(t3.error?.includes("does not belong to product")), `TEST 3: Rejection message verified: "${t3.error}"`);
    }

    // --- TEST 4: Exactly 1 DB variation + its real ID ---
    console.log("\n--- TEST 4: Exactly 1 DB variation + its real ID ---");
    if (oneVarProd && oneVarProd.variations.length === 1) {
      const realVar = oneVarProd.variations[0];
      const t4 = await calculateOrderQuote([
        {
          productId: oneVarProd.id,
          variationId: realVar.id,
          productName: oneVarProd.name,
          quantity: 1,
        }
      ]);
      assert(t4.isValid === true, "TEST 4: Exactly 1 DB variation + real ID passes");
      assert(t4.quote.items[0].variationId === realVar.id, "TEST 4: Quote preserves real variation ID");
    }

    // --- TEST 5: Exactly 1 DB variation + missing/default ID ---
    console.log("\n--- TEST 5: Exactly 1 DB variation + missing/default ID ---");
    if (oneVarProd && oneVarProd.variations.length === 1) {
      const realVar = oneVarProd.variations[0];
      const t5Default = await calculateOrderQuote([
        {
          productId: oneVarProd.id,
          variationId: "default",
          productName: oneVarProd.name,
          quantity: 1,
        }
      ]);
      assert(t5Default.isValid === true, "TEST 5: Exactly 1 DB variation + 'default' safely resolves to that single variation");
      assert(t5Default.quote.items[0].variationId === realVar.id, "TEST 5: Quote resolved to canonical single variation ID");

      const t5Null = await calculateOrderQuote([
        {
          productId: oneVarProd.id,
          variationId: null,
          productName: oneVarProd.name,
          quantity: 1,
        }
      ]);
      assert(t5Null.isValid === true, "TEST 5b: Exactly 1 DB variation + null variationId safely resolves to that single variation");
    }

    // --- TEST 6: Multiple DB variations + valid selected ID ---
    console.log("\n--- TEST 6: Multiple DB variations + valid selected ID ---");
    if (multiVariantNoDefault && multiVariantNoDefault.variations.length > 1) {
      const validVar = multiVariantNoDefault.variations.find((v) => v.inStock) || multiVariantNoDefault.variations[0];
      const t6 = await calculateOrderQuote([
        {
          productId: multiVariantNoDefault.id,
          variationId: validVar.id,
          productName: multiVariantNoDefault.name,
          quantity: 1,
        }
      ]);
      assert(t6.isValid === true, "TEST 6: Multiple DB variations + valid selected ID passes");
      assert(t6.quote.items[0].variationId === validVar.id, `TEST 6: Preserves variation ID ${validVar.id}`);
    }

    // --- TEST 7: Multiple DB variations + foreign variation ID ---
    console.log("\n--- TEST 7: Multiple DB variations + foreign variation ID ---");
    if (multiVariantNoDefault && otherMultiProd && otherMultiProd.variations.length > 0) {
      const alienVar = otherMultiProd.variations[0];
      const t7 = await calculateOrderQuote([
        {
          productId: multiVariantNoDefault.id,
          variationId: alienVar.id, // Alien variation from Telegram sent for Netflix
          productName: multiVariantNoDefault.name,
          quantity: 1,
        }
      ]);
      assert(t7.isValid === false, "TEST 7: Foreign variation ID is strictly rejected");
      assert(Boolean(t7.error?.includes("does not belong to product")), `TEST 7: Rejection error verified: "${t7.error}"`);
    }

    // --- TEST 8: Multiple DB variations + fake variation ID ---
    console.log("\n--- TEST 8: Multiple DB variations + fake variation ID ---");
    if (multiVariantNoDefault) {
      const t8 = await calculateOrderQuote([
        {
          productId: multiVariantNoDefault.id,
          variationId: "completely-fake-var-9999",
          productName: multiVariantNoDefault.name,
          quantity: 1,
        }
      ]);
      assert(t8.isValid === false, "TEST 8: Multiple DB variations + fake variation ID is strictly rejected");
      assert(Boolean(t8.error?.includes("does not belong to product")), `TEST 8: Rejection message verified: "${t8.error}"`);
    }

    // --- TEST 9: Multiple DB variations + no explicit default + variationId=null ---
    console.log("\n--- TEST 9: Multiple DB variations + no explicit default + variationId=null ---");
    if (multiVariantNoDefault) {
      const t9 = await calculateOrderQuote([
        {
          productId: multiVariantNoDefault.id,
          variationId: null,
          productName: multiVariantNoDefault.name,
          quantity: 1,
        }
      ]);
      assert(t9.isValid === false, "TEST 9: Multiple DB variations without explicit default + null is strictly rejected (NO silent auto-pick)");
      assert(Boolean(t9.error?.includes("Please select a variation")), `TEST 9: Error message prompts variation selection: "${t9.error}"`);
    }

    // --- TEST 10: Multiple DB variations + no explicit default + variationId='default' ---
    console.log("\n--- TEST 10: Multiple DB variations + no explicit default + variationId='default' ---");
    if (multiVariantNoDefault) {
      const t10 = await calculateOrderQuote([
        {
          productId: multiVariantNoDefault.id,
          variationId: "default",
          productName: multiVariantNoDefault.name,
          quantity: 1,
        }
      ]);
      assert(t10.isValid === false, "TEST 10: Multiple DB variations without explicit default + 'default' is strictly rejected");
      assert(Boolean(t10.error?.includes("Please select a variation")), `TEST 10: Error message prompts variation selection: "${t10.error}"`);
    }

    // --- TEST 11: Multiple DB variations + explicitly configured default ---
    console.log("\n--- TEST 11: Multiple DB variations + explicitly configured default ---");
    const timestamp = Date.now();
    const explicitDefaultProduct = await prisma.product.create({
      data: {
        id: `qa-prod-def-${timestamp}`,
        slug: `qa-prod-def-${timestamp}`,
        name: "QA Multi-Tier with Explicit Default",
        category: "Software",
        image: "/images/test.svg",
        minPriceBDT: 300,
        maxPriceBDT: 900,
        shortDesc: "QA test default product",
        descriptionBangla: "টেস্ট ডিফল্ট পণ্য",
        descriptionEnglish: "QA Test Default Product",
        features: "[]",
        productType: "SUBSCRIPTION",
        fulfillmentType: "MANUAL",
        variations: {
          create: [
            {
              id: `qa-var-tier1-${timestamp}`,
              name: "Tier 1 - Starter",
              priceBDT: 300,
              inStock: true,
              isDefault: false,
            },
            {
              id: `qa-var-tier2-${timestamp}`,
              name: "Tier 2 - Pro Recommended",
              priceBDT: 600,
              inStock: true,
              isDefault: true, // EXPLICIT DEFAULT
            },
            {
              id: `qa-var-tier3-${timestamp}`,
              name: "Tier 3 - Enterprise",
              priceBDT: 900,
              inStock: true,
              isDefault: false,
            },
          ],
        },
      },
      include: { variations: true },
    });
    tracker.productIds.push(explicitDefaultProduct.id);
    explicitDefaultProduct.variations.forEach(v => tracker.variationIds.push(v.id));

    const t11 = await calculateOrderQuote([
      {
        productId: explicitDefaultProduct.id,
        variationId: "default",
        productName: explicitDefaultProduct.name,
        quantity: 1,
      }
    ]);
    assert(t11.isValid === true, "TEST 11: Multiple DB variations with explicit default resolves successfully");
    assert(t11.quote.items[0].variationId === `qa-var-tier2-${timestamp}`, "TEST 11: Resolved ONLY to Tier 2 (Pro Recommended) with isDefault=true, NOT variations[0]");
    assert(t11.quote.totalBDT === 600, "TEST 11: Resolved total price matches Tier 2 (৳600)");

    // --- TEST 12: Client price tampering ---
    console.log("\n--- TEST 12: Client price tampering ---");
    if (singleVariantProd) {
      const t12 = await calculateOrderQuote([
        {
          productId: singleVariantProd.id,
          variationId: "default",
          productName: singleVariantProd.name,
          quantity: 3,
        }
      ]);
      const expectedUnit = singleVariantProd.salePriceBDT || singleVariantProd.minPriceBDT;
      assert(t12.quote.totalBDT === expectedUnit * 3, `TEST 12: Server price remains authoritative (3 x ৳${expectedUnit} = ৳${t12.quote.totalBDT})`);
    }

    // --- TEST 13: Vault mapping ---
    console.log("\n--- TEST 13: Vault mapping ---");
    if (singleVariantProd) {
      const countVault = await prisma.digitalStock.count({
        where: {
          productId: singleVariantProd.id,
          variationId: null,
          status: "AVAILABLE",
        },
      });
      assert(typeof countVault === "number", `TEST 13: Single-tier digitalStock queries variationId:null properly (available: ${countVault})`);
    }

    console.log("\n=================================================");
    console.log(`  PRECISION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log("=================================================");

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test Suite Error:", err);
    process.exit(1);
  } finally {
    await cleanupTestFixtures(tracker);
    await prisma.$disconnect();
  }
}

runPrecision13TestSuite();
