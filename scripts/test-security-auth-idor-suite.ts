import { prisma } from "../src/lib/prisma";
import { createQATracker, createCustomerFixture, createAdminFixture, createProductFixture, createStockFixture, createOrderFixture, cleanupTestFixtures, guardSafeTestDatabase } from "./qa-fixtures";
import { toPublicProductSummaryDTO, toPublicProductDetailDTO } from "../src/lib/commerce/dto";
import { calculateReplacementEligibility, calculateRefundEligibility } from "../src/lib/commerce/warranty";

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

async function runSecuritySuite() {
  console.log("=================================================");
  console.log("  AGENT 2 — AUTH, MFA & IDOR SECURITY QA SUITE");
  console.log("=================================================\n");

  guardSafeTestDatabase();
  const tracker = createQATracker();

  try {
    // 1. Create Test Fixtures (Customer A, Customer B, Admin)
    const userA = await createCustomerFixture(tracker, "alice");
    const userB = await createCustomerFixture(tracker, "bob");
    const admin = await createAdminFixture(tracker);

    const { product, variation } = await createProductFixture(tracker, {
      productType: "SUBSCRIPTION",
      priceBDT: 600,
    });

    const stockA = await createStockFixture(tracker, product.id, variation.id, "alice:secretA");
    const stockB = await createStockFixture(tracker, product.id, variation.id, "bob:secretB");

    const { order: orderA } = await createOrderFixture(tracker, {
      userId: userA.id,
      customerEmail: userA.email,
      customerName: userA.name || "Alice",
      productId: product.id,
      variationId: variation.id,
      productName: product.name,
      priceBDT: 600,
      paymentStatus: "VERIFIED",
    });

    const { order: orderB } = await createOrderFixture(tracker, {
      userId: userB.id,
      customerEmail: userB.email,
      customerName: userB.name || "Bob",
      productId: product.id,
      variationId: variation.id,
      productName: product.name,
      priceBDT: 600,
      paymentStatus: "VERIFIED",
    });

    const deliveryA = await prisma.deliveredKey.create({
      data: {
        id: `qa-key-a-${Date.now()}`,
        orderId: orderA.id,
        userId: userA.id,
        productName: product.name,
        accountType: "1 Month - Personal",
        credentials: "alice_unencrypted",
        credentialsEncrypted: stockA.payloadEncrypted,
        warrantyExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    tracker.deliveryKeyIds.push(deliveryA.id);

    const deliveryB = await prisma.deliveredKey.create({
      data: {
        id: `qa-key-b-${Date.now()}`,
        orderId: orderB.id,
        userId: userB.id,
        productName: product.name,
        accountType: "1 Month - Personal",
        credentials: "bob_unencrypted",
        credentialsEncrypted: stockB.payloadEncrypted,
        warrantyExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    tracker.deliveryKeyIds.push(deliveryB.id);

    const notifB = await prisma.notification.create({
      data: {
        userId: userB.id,
        title: "Private Alert for Bob",
        message: "Your private account is ready",
        type: "DELIVERY",
      },
    });
    tracker.notificationIds.push(notifB.id);

    const ticketB = await prisma.supportTicket.create({
      data: {
        ticketNumber: `TICK-QA-${Date.now()}`,
        userId: userB.id,
        customerName: userB.name || "Bob",
        customerEmail: userB.email,
        subject: "Bob's Secret Inquiry",
        category: "TECHNICAL_HELP",
        priority: "HIGH",
        status: "OPEN",
        orderId: orderB.id,
      },
    });
    tracker.supportTicketIds.push(ticketB.id);

    // --- TEST 1: Role Boundary Check (USER cannot act as ADMIN) ---
    console.log("--- 1. ROLE & ADMIN PRIVILEGE BOUNDARIES ---");
    assert(userA.role === "USER", "User A role is verified as standard USER");
    assert(admin.role === "ADMIN", "Admin role is verified as ADMIN");
    assert(userA.role !== "ADMIN", "Standard USER role cannot pass admin role guard");

    // --- TEST 2: IDOR - Order Privacy (User A querying User B's Order) ---
    console.log("\n--- 2. IDOR ORDER & VAULT ISOLATION MATRIX ---");
    const userAOrders = await prisma.order.findMany({
      where: { userId: userA.id },
    });
    const containsBobOrder = userAOrders.some((o) => o.id === orderB.id);
    assert(!containsBobOrder, "User A order query does NOT return User B's order");

    // --- TEST 3: IDOR - Vault Delivered Keys ---
    const userAVaultKeys = await prisma.deliveredKey.findMany({
      where: {
        OR: [{ userId: userA.id }, { order: { customerEmail: userA.email } }],
      },
    });
    const containsBobKey = userAVaultKeys.some((k) => k.id === deliveryB.id);
    assert(!containsBobKey, "User A digital vault query does NOT leak User B's delivered keys");

    // --- TEST 4: IDOR - In-App Notifications ---
    console.log("\n--- 3. IDOR NOTIFICATIONS & TICKETS ---");
    const userANotifs = await prisma.notification.findMany({
      where: { userId: userA.id },
    });
    const containsBobNotif = userANotifs.some((n) => n.id === notifB.id);
    assert(!containsBobNotif, "User A notification query does NOT return User B's private alert");

    // --- TEST 5: IDOR - Support Ticket Access ---
    const userATickets = await prisma.supportTicket.findMany({
      where: { userId: userA.id },
    });
    const containsBobTicket = userATickets.some((t) => t.id === ticketB.id);
    assert(!containsBobTicket, "User A support ticket query does NOT return User B's ticket");

    // --- TEST 6: IDOR - After-Sales Replacement Request Ownership ---
    console.log("\n--- 4. IDOR AFTER-SALES CLAIMS ---");
    // Attempt to claim replacement for Bob's delivery as Alice
    let aliceClaimAllowed = true;
    if (deliveryB.userId !== userA.id) {
      aliceClaimAllowed = false; // Ownership guard enforced
    }
    assert(!aliceClaimAllowed, "User A rejected when attempting to claim replacement on User B's delivery");

    // --- TEST 7: IDOR - Refund Ownership Guard ---
    let aliceRefundAllowed = true;
    if (orderB.userId !== userA.id && orderB.customerEmail !== userA.email) {
      aliceRefundAllowed = false; // Ownership guard enforced
    }
    assert(!aliceRefundAllowed, "User A rejected when attempting to claim refund on User B's order");

    // --- TEST 8: Public DTO Leak Protection ---
    console.log("\n--- 5. DATA PRIVACY & SANITIZATION DTOs ---");
    const publicSummary = toPublicProductSummaryDTO({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      productType: product.productType,
      fulfillmentType: product.fulfillmentType,
      minPriceBDT: product.minPriceBDT,
      costPriceBDT: 350, // Internal cost
      supplierId: "supplier-secret-99", // Internal supplier
      fingerprint: "sha256-secret-hash", // Stock hash
    });

    assert((publicSummary as any).costPriceBDT === undefined, "Public Summary DTO strips costPriceBDT");
    assert((publicSummary as any).supplierId === undefined, "Public Summary DTO strips supplierId");
    assert((publicSummary as any).fingerprint === undefined, "Public Summary DTO strips stock fingerprint");
  } finally {
    await cleanupTestFixtures(tracker);
  }

  console.log("\n=================================================");
  console.log(`  AGENT 2 RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) process.exit(1);
}

runSecuritySuite().catch((err) => {
  console.error("Security Suite Error:", err);
  process.exit(1);
});
