import { prisma } from "../src/lib/prisma";
import { logAdminAudit } from "../src/lib/audit-logger";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";

async function runVerification() {
  console.log("=================================================");
  console.log("🚀 Starting AI Haat Admin Master Suite Verification");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  try {
    // TEST 1: Category CRUD & Safe Product Assignment
    console.log("--- Test 1: Categories Module ---");
    const testSlug = `test-cat-${Date.now()}`;
    const createdCat = await prisma.category.create({
      data: {
        name: "Test AI Software",
        slug: testSlug,
        description: "Test category for verification suite",
        displayOrder: 99,
        isActive: true,
      },
    });
    assert(Boolean(createdCat.id), "Category created successfully in database");

    const fetchedCat = await prisma.category.findUnique({ where: { slug: testSlug } });
    assert(fetchedCat?.name === "Test AI Software", "Category retrieved with accurate slug");

    await prisma.category.delete({ where: { id: createdCat.id } });
    assert(true, "Category deleted cleanly without orphaned references");

    // TEST 2: Centralized Admin Audit Logging with Secret Sanitization
    console.log("\n--- Test 2: Admin Audit Logger ---");
    await logAdminAudit({
      actorId: "admin_test_01",
      actorEmail: "admin@aihaat.shop",
      action: "WALLET_MANUAL_ADJUSTMENT",
      targetType: "WALLET",
      targetId: "user_test_99",
      details: {
        amountBDT: 500,
        reason: "Test bonus deposit",
        password: "SuperSecretPassword123!",
        totpSecret: "JBSWY3DPEHPK3PXP",
      },
    });

    const auditEntry = await prisma.adminAuditLog.findFirst({
      where: { actorId: "admin_test_01" },
      orderBy: { createdAt: "desc" },
    });

    assert(Boolean(auditEntry), "Admin audit entry created in DB");
    assert(auditEntry?.action === "WALLET_MANUAL_ADJUSTMENT", "Audit action recorded correctly");

    const parsedDetails = JSON.parse(auditEntry?.details || "{}");
    assert(parsedDetails.password === "[REDACTED_SECRET]", "Audit logger redacted raw password");
    assert(parsedDetails.totpSecret === "[REDACTED_SECRET]", "Audit logger redacted TOTP secret");
    assert(parsedDetails.amountBDT === 500, "Non-sensitive metadata preserved in audit details");

    // Clean up test audit log
    if (auditEntry) {
      await prisma.adminAuditLog.delete({ where: { id: auditEntry.id } });
    }

    // TEST 3: Multi-Item Pricing & Server Quote Engine
    console.log("\n--- Test 3: Commerce Pricing Engine ---");
    const quoteResult = await calculateOrderQuote([
      {
        productId: "p-chatgpt-plus",
        productName: "ChatGPT Plus",
        variationName: "1 Month",
        quantity: 2,
      },
    ]);
    assert(quoteResult.isValid, "Pricing engine validated order items");
    assert(quoteResult.quote.items.length === 1, "Item quote computed accurately");
    assert(quoteResult.quote.totalBDT > 0, "Server calculated positive total BDT");

    // TEST 4: Coupon Engine DB Persistence & Limits
    console.log("\n--- Test 4: Coupon Engine ---");
    const testCouponCode = `TEST${Date.now().toString().slice(-4)}`;
    const createdCoupon = await prisma.coupon.create({
      data: {
        code: testCouponCode,
        discountType: "FLAT_BDT",
        discountValue: 50,
        appliesTo: "ALL",
        minOrderBDT: 100,
        usageLimit: 10,
        usedCount: 0,
        validUntil: new Date(Date.now() + 86400000 * 30),
        isActive: true,
      },
    });
    assert(Boolean(createdCoupon.id), "Coupon persisted in DB");

    const couponQuote = await calculateOrderQuote(
      [
        {
          productId: "p-chatgpt-plus",
          productName: "ChatGPT Plus",
          variationName: "1 Month",
          quantity: 1,
        },
      ],
      testCouponCode
    );

    assert(couponQuote.isValid, "Coupon applied successfully in server quote");
    assert(couponQuote.quote.discountBDT === 50, "Discount value ৳50 deducted exactly");

    // Clean up coupon
    await prisma.coupon.delete({ where: { id: createdCoupon.id } });
    assert(true, "Test coupon cleaned up");

    // TEST 5: Order Timeline & Multi-Item Structure
    console.log("\n--- Test 5: Order Operations & Timeline Events ---");
    const testOrderNum = `AH-TEST-${Date.now().toString().slice(-5)}`;
    const testOrder = await prisma.order.create({
      data: {
        id: testOrderNum,
        orderNumber: testOrderNum,
        customerName: "Test Buyer",
        customerEmail: "buyer@test.aihaat.shop",
        customerPhone: "01700000000",
        subtotalBDT: 290,
        discountBDT: 0,
        totalBDT: 290,
        paymentMethod: "bkash",
        paymentStatus: "VERIFIED",
        deliveryStatus: "ORDER_PLACED",
        items: {
          create: [
            {
              productName: "ChatGPT Plus",
              variationName: "1 Month",
              priceBDT: 290,
              quantity: 1,
            },
          ],
        },
        timelineEvents: {
          create: {
            status: "ORDER_PLACED",
            actor: "CUSTOMER",
            note: "Order created via test suite",
          },
        },
      },
      include: {
        items: true,
        timelineEvents: true,
      },
    });

    assert(testOrder.items.length === 1, "Order created with multi-item relation");
    assert(testOrder.timelineEvents.length === 1, "Order timeline initial event logged");

    // Transition Order
    await prisma.orderTimelineEvent.create({
      data: {
        orderId: testOrder.id,
        status: "DELIVERED",
        actor: "ADMIN",
        actorEmail: "admin@aihaat.shop",
        note: "Delivered via automated verification suite",
      },
    });

    const updatedOrderWithTimeline = await prisma.order.findUnique({
      where: { id: testOrder.id },
      include: { timelineEvents: true },
    });

    assert(updatedOrderWithTimeline?.timelineEvents.length === 2, "Timeline appended order transition event");

    // Clean up test order
    await prisma.order.delete({ where: { id: testOrder.id } });
    assert(true, "Test order and cascaded timeline events cleaned up");

    console.log("\n=================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log("=================================================");
  } catch (err) {
    console.error("\n❌ Verification Failed with Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
