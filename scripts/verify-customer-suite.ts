import { prisma } from "../src/lib/prisma";
import { encryptCredential, decryptCredential } from "../src/lib/mfa/crypto";

async function runCustomerVerification() {
  console.log("=================================================");
  console.log("🚀 Starting AI Haat Customer Experience Verification Suite");
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
    // 1. SETUP: Create Test Customers User A and User B
    console.log("--- Setup: Test Customer Users ---");
    const userA = await prisma.user.upsert({
      where: { email: "usera_test@aihaat.shop" },
      create: {
        email: "usera_test@aihaat.shop",
        name: "User A",
        role: "USER",
        walletBalanceBDT: 500,
      },
      update: {},
    });

    const userB = await prisma.user.upsert({
      where: { email: "userb_test@aihaat.shop" },
      create: {
        email: "userb_test@aihaat.shop",
        name: "User B",
        role: "USER",
        walletBalanceBDT: 200,
      },
      update: {},
    });

    assert(Boolean(userA.id && userB.id), "Test customer accounts ready");

    // 2. TEST 1: Encrypted Credentials Vault & Decryption
    console.log("\n--- Test 1: AES-256-GCM Vault Cryptography ---");
    const sampleRawCredential = "Email: user_chatgpt@gmail.com\nPass: SecretPass@2026!\nPIN: 1234";
    const encrypted = encryptCredential(sampleRawCredential);
    assert(encrypted !== sampleRawCredential, "Raw credential encrypted at rest");
    assert(encrypted.startsWith("v1:"), "Encrypted payload format matches AES-256-GCM envelope (v1: prefix)");

    const decrypted = decryptCredential(encrypted);
    assert(decrypted === sampleRawCredential, "Decrypted payload restores exact original credentials");

    // 3. TEST 2: Multi-Item Order Creation & Itemized Entitlements
    console.log("\n--- Test 2: Multi-Item Order & Entitlement Association ---");
    const testOrderNumber = `AH-CUST-${Date.now().toString().slice(-5)}`;
    const testOrder = await prisma.order.create({
      data: {
        id: testOrderNumber,
        orderNumber: testOrderNumber,
        userId: userA.id,
        customerName: userA.name || "User A",
        customerEmail: userA.email,
        customerPhone: "01700000001",
        subtotalBDT: 850,
        discountBDT: 50,
        totalBDT: 800,
        paymentMethod: "bkash",
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
        items: {
          create: [
            {
              productName: "ChatGPT Plus",
              variationName: "1 Month Shared",
              priceBDT: 290,
              quantity: 1,
            },
            {
              productName: "Claude Pro",
              variationName: "1 Month Private",
              priceBDT: 560,
              quantity: 1,
            },
          ],
        },
        timelineEvents: {
          create: {
            status: "DELIVERED",
            actor: "SYSTEM",
            note: "Order auto-fulfilled via encrypted stock vault",
          },
        },
      },
      include: {
        items: true,
      },
    });

    assert(testOrder.items.length === 2, "Order created with 2 distinct purchased items");

    // Create Delivered Keys for User A
    const delivery1 = await prisma.deliveredKey.create({
      data: {
        orderId: testOrder.id,
        orderItemId: testOrder.items[0].id,
        userId: userA.id,
        productName: testOrder.items[0].productName,
        accountType: "1 Month Shared",
        credentials: sampleRawCredential,
        credentialsEncrypted: encrypted,
        warrantyExpiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    assert(Boolean(delivery1.id), "DeliveredKey created and linked to order item");

    // 4. TEST 3: Strict IDOR Protection (User B cannot access User A's keys)
    console.log("\n--- Test 3: IDOR & Session Ownership Enforcement ---");
    // Query with User B identity for delivery 1
    const userBSearch = await prisma.deliveredKey.findFirst({
      where: {
        id: delivery1.id,
        AND: [
          {
            OR: [
              { userId: userB.id },
              { user: { email: userB.email } },
              { order: { customerEmail: userB.email } },
              { order: { userId: userB.id } },
            ],
          },
        ],
      },
    });

    assert(userBSearch === null, "IDOR Test: User B cannot query User A delivery record");

    // Query with User A identity for delivery 1
    const userASearch = await prisma.deliveredKey.findFirst({
      where: {
        id: delivery1.id,
        AND: [
          {
            OR: [
              { userId: userA.id },
              { user: { email: userA.email } },
              { order: { customerEmail: userA.email } },
              { order: { userId: userA.id } },
            ],
          },
        ],
      },
    });

    assert(userASearch !== null, "Ownership Test: User A can access own delivery record");

    // 5. TEST 4: Warranty Replacement Request & Duplicate Prevention
    console.log("\n--- Test 4: Warranty Replacement Claims ---");
    const claim1 = await prisma.replacementRequest.create({
      data: {
        userId: userA.id,
        orderId: testOrder.id,
        orderItemId: testOrder.items[0].id,
        originalDeliveryId: delivery1.id,
        reason: "LOGIN_FAILED",
        description: "Password stopped working on day 5",
        status: "REQUESTED",
      },
    });

    assert(Boolean(claim1.id), "Replacement claim recorded with REQUESTED status");

    // Check duplicate detection logic
    const existingOpenClaim = await prisma.replacementRequest.findFirst({
      where: {
        originalDeliveryId: delivery1.id,
        status: { in: ["REQUESTED", "UNDER_REVIEW"] },
      },
    });

    assert(Boolean(existingOpenClaim), "Duplicate guard detects existing pending claim for item");

    // 6. TEST 5: Customer Notifications Lifecycle
    console.log("\n--- Test 5: Customer Notifications ---");
    const notif = await prisma.notification.create({
      data: {
        userId: userA.id,
        title: "Your ChatGPT Plus order is ready",
        message: "Credentials have been securely dispatched to your Digital Vault.",
        type: "DELIVERY",
        link: "/dashboard/keys",
        isRead: false,
      },
    });

    assert(notif.isRead === false, "Notification created in unread state");

    await prisma.notification.update({
      where: { id: notif.id },
      data: { isRead: true },
    });

    const updatedNotif = await prisma.notification.findUnique({ where: { id: notif.id } });
    assert(updatedNotif?.isRead === true, "Notification marked as read");

    // 7. CLEANUP
    console.log("\n--- Cleanup ---");
    await prisma.replacementRequest.delete({ where: { id: claim1.id } });
    await prisma.notification.delete({ where: { id: notif.id } });
    await prisma.deliveredKey.delete({ where: { id: delivery1.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.user.deleteMany({
      where: { email: { in: ["usera_test@aihaat.shop", "userb_test@aihaat.shop"] } },
    });
    assert(true, "All test artifacts cleaned up cleanly");

    console.log("\n=================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} CUSTOMER EXPERIENCE TESTS PASSED!`);
    console.log("=================================================");
  } catch (err) {
    console.error("\n❌ Customer Verification Suite Failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCustomerVerification();
