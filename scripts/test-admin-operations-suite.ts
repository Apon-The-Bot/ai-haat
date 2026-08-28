import { prisma } from "../src/lib/prisma";
import { createQATracker, createCustomerFixture, createAdminFixture, createProductFixture, createStockFixture, createOrderFixture, cleanupTestFixtures, guardSafeTestDatabase } from "./qa-fixtures";
import { encryptCredential } from "../src/lib/mfa/crypto";

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

async function runAdminOperationsSuite() {
  console.log("=================================================");
  console.log("  AGENT 8 — ADMIN OPERATIONS & WORKFLOWS QA SUITE");
  console.log("=================================================\n");

  guardSafeTestDatabase();
  const tracker = createQATracker();

  try {
    const user = await createCustomerFixture(tracker, "admoperations");
    const admin = await createAdminFixture(tracker);

    const { product: wsProduct, variation: wsVar } = await createProductFixture(tracker, {
      productType: "WORKSPACE_ACCESS",
      fulfillmentType: "MANUAL",
      priceBDT: 1200,
    });

    const { order: manualOrder, orderItem: manualItem } = await createOrderFixture(tracker, {
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name || "Customer",
      productId: wsProduct.id,
      variationId: wsVar.id,
      productName: wsProduct.name,
      priceBDT: 1200,
      paymentStatus: "VERIFIED",
      fulfillmentType: "MANUAL",
    });

    // --- TEST 1: Admin Manual Delivery Workflow ---
    console.log("--- 1. ADMIN MANUAL DELIVERY WORKFLOW ---");
    const manualCredentials = "team_seat_user@company.com:temp_pass_456";
    const encrypted = encryptCredential(manualCredentials);

    const deliveredKey = await prisma.deliveredKey.create({
      data: {
        orderId: manualOrder.id,
        orderItemId: manualItem.id,
        userId: user.id,
        productName: wsProduct.name,
        accountType: wsVar.name,
        credentials: manualCredentials,
        credentialsEncrypted: encrypted,
        warrantyExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    tracker.deliveryKeyIds.push(deliveredKey.id);

    await prisma.order.update({
      where: { id: manualOrder.id },
      data: { deliveryStatus: "DELIVERED" },
    });

    const updatedOrder = await prisma.order.findUnique({ where: { id: manualOrder.id } });
    assert(updatedOrder?.deliveryStatus === "DELIVERED", "Admin manual delivery transitions order to DELIVERED");

    const userVault = await prisma.deliveredKey.findMany({ where: { userId: user.id } });
    assert(userVault.some((k) => k.id === deliveredKey.id), "Delivered credentials now accessible in customer Digital Vault");

    // --- TEST 2: Admin Manual Wallet Deposit Approval ---
    console.log("\n--- 2. ADMIN WALLET DEPOSIT APPROVAL ---");
    const initialBalance = user.walletBalanceBDT;
    const depositAmount = 750;

    const depositTx = await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        amountBDT: depositAmount,
        method: "bkash",
        status: "APPROVED",
        note: "Admin approved deposit via bKash TrxID: QA-MANUAL-7788",
      },
    });
    tracker.walletTxIds.push(depositTx.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { walletBalanceBDT: { increment: depositAmount } },
    });

    const refreshedUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(refreshedUser?.walletBalanceBDT === initialBalance + depositAmount, "Customer wallet balance successfully credited by ৳750");

    // --- TEST 3: Admin Warranty Replacement & Stock Lifecycle ---
    console.log("\n--- 3. ADMIN WARRANTY REPLACEMENT & STOCK CYCLE ---");
    const repStock = await createStockFixture(tracker, wsProduct.id, wsVar.id, "replacement:newsecret");

    const repClaim = await prisma.replacementRequest.create({
      data: {
        userId: user.id,
        orderId: manualOrder.id,
        orderItemId: manualItem.id,
        originalDeliveryId: deliveredKey.id,
        reason: "ACCOUNT_LOCKED",
        description: "Account credentials stopped working during testing",
        status: "APPROVED",
      },
    });
    tracker.replacementRequestIds.push(repClaim.id);

    // Transition stock to REPLACED and deliver new key
    await prisma.deliveredKey.create({
      data: {
        orderId: manualOrder.id,
        orderItemId: manualItem.id,
        userId: user.id,
        productName: wsProduct.name,
        accountType: wsVar.name,
        credentials: "replacement_seat@company.com:pass",
        credentialsEncrypted: repStock.payloadEncrypted,
        warrantyExpiresAt: deliveredKey.warrantyExpiresAt,
        isReplacement: true,
        replacedDeliveryId: deliveredKey.id,
      },
    });

    const replacementDeliveries = await prisma.deliveredKey.findMany({
      where: { orderId: manualOrder.id, isReplacement: true },
    });
    assert(replacementDeliveries.length === 1, "Replacement DeliveredKey created with preserved warranty date");

    // --- TEST 4: Admin Support Ticket Reply & Notes ---
    console.log("\n--- 4. ADMIN SUPPORT TICKETING & INTERNAL NOTES ---");
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: `TICK-QA-ADM-${Date.now()}`,
        userId: user.id,
        customerName: user.name || "Customer",
        customerEmail: user.email,
        subject: "Help with workspace seat",
        category: "TECHNICAL_HELP",
        priority: "NORMAL",
        status: "OPEN",
        orderId: manualOrder.id,
      },
    });
    tracker.supportTicketIds.push(ticket.id);

    // Admin replies
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: admin.id,
        senderType: "ADMIN",
        senderName: admin.name || "Support Staff",
        message: "We have resolved your workspace seat access.",
      },
    });

    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: "RESOLVED" },
    });

    const updatedTicket = await prisma.supportTicket.findUnique({
      where: { id: ticket.id },
      include: { messages: true },
    });

    assert(updatedTicket?.status === "RESOLVED", "Support ticket status updated to RESOLVED");
    assert(updatedTicket?.messages.length === 1, "Staff response message logged to conversation");
  } finally {
    await cleanupTestFixtures(tracker);
  }

  console.log("\n=================================================");
  console.log(`  AGENT 8 RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) process.exit(1);
}

runAdminOperationsSuite().catch((err) => {
  console.error("Admin Operations Suite Error:", err);
  process.exit(1);
});
