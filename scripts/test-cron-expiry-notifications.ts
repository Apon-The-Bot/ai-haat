import { prisma } from "../src/lib/prisma";
import { runInventoryExpiryCheck } from "../src/lib/commerce/inventory";

async function main() {
  console.log("=================================================");
  console.log("  TEST: AUTOMATED CUSTOMER EXPIRY & NOTIFICATIONS");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const testEmail = `cron_test_${timestamp}@aihaat.shop`;
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  // 1. Create Test User
  const user = await prisma.user.create({
    data: {
      id: `test-cron-user-${timestamp}`,
      email: testEmail,
      name: "Cron Test Customer",
    },
  });

  // 2. Create Test Product & Order
  const product = await prisma.product.create({
    data: {
      id: `test-cron-prod-${timestamp}`,
      slug: `test-cron-prod-${timestamp}`,
      name: "Test Expiring Tool",
      category: "AI Tools",
      image: "/images/test.svg",
      minPriceBDT: 500,
      maxPriceBDT: 500,
      regularPriceBDT: 500,
      shortDesc: "Cron test tool",
      descriptionBangla: "টেস্ট",
      descriptionEnglish: "Test",
      features: JSON.stringify(["Feature 1"]),
      productType: "SUBSCRIPTION",
      fulfillmentType: "AUTO_STOCK",
      warrantyDays: 30,
    },
  });

  const order = await prisma.order.create({
    data: {
      id: `TEST-ORD-CRON-${timestamp}`,
      orderNumber: `TEST-ORD-CRON-${timestamp}`,
      userId: user.id,
      customerName: user.name || "Cron Test Customer",
      customerEmail: user.email,
      customerPhone: "01700000099",
      subtotalBDT: 500,
      totalBDT: 500,
      paymentMethod: "bKash",
      paymentStatus: "VERIFIED",
    },
  });

  // 3. Create DeliveredKey expiring in 2 days
  const deliveredKey = await prisma.deliveredKey.create({
    data: {
      id: `test-key-cron-${timestamp}`,
      orderId: order.id,
      userId: user.id,
      productName: product.name,
      accountType: "1 Month - Personal",
      credentials: "test-user:test-pass",
      credentialsEncrypted: "encrypted",
      warrantyExpiresAt: twoDaysFromNow,
      isReplacement: false,
    },
  });

  // 4. Create DigitalStock expiring in 2 days
  const stock = await prisma.digitalStock.create({
    data: {
      id: `test-stock-cron-${timestamp}`,
      productId: product.id,
      payloadEncrypted: "encrypted_stock",
      type: "ACCOUNT_CREDENTIAL",
      status: "AVAILABLE",
      expiryDate: twoDaysFromNow,
    },
  });

  console.log("  Created test user, order, delivered key, and digital stock.");

  // 5. Execute runInventoryExpiryCheck()
  console.log("  Executing runInventoryExpiryCheck()...");
  const report = await runInventoryExpiryCheck();

  console.log(`  Report:`, report);

  // 6. Verify Notifications
  const updatedStock = await prisma.digitalStock.findUnique({
    where: { id: stock.id },
  });

  const inAppNotif = await prisma.notification.findFirst({
    where: {
      userId: user.id,
      title: { contains: product.name },
    },
  });

  const isStockMarked = updatedStock?.isExpiringSoon === true;
  const isNotifCreated = inAppNotif !== null;

  console.log(`  Stock Marked Expiring Soon: ${isStockMarked ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  In-App Expiry Notification Created: ${isNotifCreated ? "✅ PASS" : "❌ FAIL"}`);
  if (inAppNotif) {
    console.log(`  Notification Title: "${inAppNotif.title}"`);
    console.log(`  Notification Message: "${inAppNotif.message}"`);
  }

  // 7. Cleanup
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.deliveredKey.deleteMany({ where: { orderId: order.id } });
  await prisma.digitalStock.deleteMany({ where: { productId: product.id } });
  await prisma.order.deleteMany({ where: { id: order.id } });
  await prisma.product.deleteMany({ where: { id: product.id } });
  await prisma.user.deleteMany({ where: { id: user.id } });

  console.log("  Cleaned up all test records.");

  if (!isStockMarked || !isNotifCreated) {
    throw new Error("Automated customer expiry check test failed!");
  }

  console.log("\n✅ ALL CRON NOTIFICATION TESTS PASSED SUCCESSFULLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
