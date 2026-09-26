import { prisma } from "../src/lib/prisma";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";
import { getAllProducts } from "../src/lib/products-db";
import { randomBytes } from "crypto";

async function runE2ETests() {
  console.log("=== STARTING QUICK CHECKOUT E2E AUDIT & TESTS ===\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || "Condition not met"}`);
      process.exitCode = 1;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Product Fetch & Variation Integrity
    // -------------------------------------------------------------
    console.log("--- Test Suite 1: Product & Variation Integrity ---");
    const products = await getAllProducts();
    assert(products.length > 0, "Products exist in store", `Found ${products.length} products`);

    const inStockProduct = products.find((p) => p.inStock !== false && (!p.variations || p.variations.some(v => v.inStock !== false))) || products[0];
    assert(!!inStockProduct, `Test product resolved: "${inStockProduct?.name}" (slug: ${inStockProduct?.slug}, inStock: ${inStockProduct?.inStock})`);

    const variation = inStockProduct.variations?.find(v => v.inStock !== false) || inStockProduct.variations?.[0] || {
      id: "default",
      name: "Standard",
      priceBDT: inStockProduct.minPriceBDT || 290,
      inStock: true,
    };
    assert(variation.priceBDT > 0, `Variation price is positive: ৳${variation.priceBDT}`);

    // -------------------------------------------------------------
    // TEST 2: Server-Authoritative Quote Calculation
    // -------------------------------------------------------------
    console.log("\n--- Test Suite 2: Pricing Calculation & Recalculation ---");
    const quoteResult = await calculateOrderQuote([
      {
        productId: inStockProduct.id || inStockProduct.slug,
        variationId: variation.id === "default" ? null : variation.id,
        productName: inStockProduct.name,
        variationName: variation.name,
        quantity: 2,
      },
    ]);

    if (!quoteResult.isValid) {
      console.error("Quote error detail:", quoteResult.error);
    }
    assert(quoteResult.isValid, "Quote calculation is valid", quoteResult.error);
    assert(quoteResult.quote.items.length === 1, "Quote item count matches input");
    assert(
      quoteResult.quote.subtotalBDT === variation.priceBDT * 2,
      `Subtotal matches quantity * price (Expected: ৳${variation.priceBDT * 2}, Got: ৳${quoteResult.quote.subtotalBDT})`
    );
    assert(quoteResult.quote.totalBDT > 0, `Total payable is positive: ৳${quoteResult.quote.totalBDT}`);

    // -------------------------------------------------------------
    // TEST 3: Express 1-Click Order Creation (Guest Pathway)
    // -------------------------------------------------------------
    console.log("\n--- Test Suite 3: Express Guest Order Creation Simulation ---");
    const testOrderNumber = `TEST-QC-${randomBytes(3).toString("hex").toUpperCase()}`;
    const guestPayload = {
      orderNumber: testOrderNumber,
      customerName: "Md Test Buyer",
      customerEmail: "quickcheckout.test@example.com",
      customerPhone: "01700000000",
      paymentMethod: "gateway",
      senderNumber: "GATEWAY",
      trxId: "GATEWAY_QUICK_PENDING",
      totalBDT: quoteResult.quote.totalBDT,
      subtotalBDT: quoteResult.quote.subtotalBDT,
      discountBDT: 0,
      paymentStatus: "PENDING",
      deliveryStatus: "ORDER_PLACED",
      notes: "[1-Click Express Buy] Preferred Delivery: WHATSAPP (01700000000)",
    };

    // Insert order via Prisma
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: guestPayload.orderNumber,
        customerName: guestPayload.customerName,
        customerEmail: guestPayload.customerEmail,
        customerPhone: guestPayload.customerPhone,
        totalBDT: guestPayload.totalBDT,
        subtotalBDT: guestPayload.subtotalBDT,
        discountBDT: guestPayload.discountBDT,
        paymentMethod: guestPayload.paymentMethod,
        senderNumber: guestPayload.senderNumber,
        trxId: guestPayload.trxId,
        paymentStatus: "PENDING",
        deliveryStatus: "ORDER_PLACED",
        notes: guestPayload.notes,
        items: {
          create: quoteResult.quote.items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            variationId: it.variationId,
            variationName: it.variationName,
            priceBDT: it.priceBDT,
            quantity: it.quantity,
            image: it.image || "/logo.png",
          })),
        },
      },
      include: { items: true },
    });

    assert(!!createdOrder.id, `Order created in DB with ID: ${createdOrder.id}`);
    assert(createdOrder.orderNumber === testOrderNumber, "Order number matches generated reference");
    assert(createdOrder.items.length === 1, "Order items persisted correctly");
    assert(Boolean(createdOrder.notes?.includes("Preferred Delivery: WHATSAPP")), "WhatsApp delivery preference recorded in notes");

    // -------------------------------------------------------------
    // TEST 4: Wallet Payment & Balance Check Simulation
    // -------------------------------------------------------------
    console.log("\n--- Test Suite 4: Wallet Payment & Debit Simulation ---");
    // Create temporary test user with wallet balance
    const testUserEmail = `wallet.qc.test.${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: "Quick Wallet Tester",
        phone: "01800000000",
        walletBalanceBDT: 1000,
        role: "USER",
      },
    });

    assert(testUser.walletBalanceBDT === 1000, "Test user created with 1000 BDT wallet balance");

    // Atomic debit simulation (same logic as /api/wallet/purchase)
    const debitAmount = 300;
    const debitResult = await prisma.user.updateMany({
      where: {
        id: testUser.id,
        walletBalanceBDT: { gte: debitAmount },
      },
      data: {
        walletBalanceBDT: { decrement: debitAmount },
      },
    });

    assert(debitResult.count === 1, "Atomic wallet balance debit executed successfully");

    const refreshedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert(refreshedUser?.walletBalanceBDT === 700, `Updated wallet balance is 700 BDT (Got: ${refreshedUser?.walletBalanceBDT})`);

    // Clean up test data
    console.log("\n--- Cleaning up temporary test records ---");
    await prisma.orderItem.deleteMany({ where: { orderId: createdOrder.id } });
    await prisma.order.delete({ where: { id: createdOrder.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("Cleaned up test order and test user successfully.");

    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    console.log(`\n========================================`);
    console.log(`E2E AUDIT RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error("Critical error in E2E test suite:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
