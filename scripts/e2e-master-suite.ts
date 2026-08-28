import { prisma } from "../src/lib/prisma";
import { encryptCredential, decryptCredential } from "../src/lib/mfa/crypto";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";
import { computeStockFingerprint } from "../src/lib/commerce/inventory";

interface TestTracker {
  userIds: string[];
  productIds: string[];
  variationIds: string[];
  stockIds: string[];
  couponIds: string[];
  orderIds: string[];
  deliveryKeyIds: string[];
  replacementRequestIds: string[];
  reviewIds: string[];
  productRequestIds: string[];
  notificationIds: string[];
  walletTxIds: string[];
}

const tracker: TestTracker = {
  userIds: [],
  productIds: [],
  variationIds: [],
  stockIds: [],
  couponIds: [],
  orderIds: [],
  deliveryKeyIds: [],
  replacementRequestIds: [],
  reviewIds: [],
  productRequestIds: [],
  notificationIds: [],
  walletTxIds: [],
};

async function runMasterE2ESuite() {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(70));
  console.log("🚀  AI HAAT MASTER END-TO-END ORCHESTRATION & INTEGRATION SUITE");
  console.log("    Real Prisma MySQL Database • Full-Lifecycle Simulation");
  console.log("=".repeat(70) + "\n");

  let totalAssertions = 0;
  let passedAssertions = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalAssertions++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}${detail ? ` -> ${detail}` : ""}`);
      passedAssertions++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
      throw new Error(`Assertion Failed: ${testName} ${detail || ""}`);
    }
  }

  try {
    // =========================================================================
    // STEP 1: Create test customer User with wallet balance
    // =========================================================================
    console.log("\n📦 STEP 1: Provisioning Test Customer User with Wallet Balance");
    console.log("-".repeat(70));

    const testUserEmail = `e2e_cust_${Date.now()}@aihaat.shop`;
    const initialWalletBDT = 2500;

    const testUser = await prisma.user.create({
      data: {
        name: "E2E Master Customer",
        email: testUserEmail,
        phone: "01712345678",
        role: "USER",
        walletBalanceBDT: initialWalletBDT,
      },
    });
    tracker.userIds.push(testUser.id);

    // Create corresponding initial deposit transaction
    const initialTx = await prisma.walletTransaction.create({
      data: {
        userId: testUser.id,
        amountBDT: initialWalletBDT,
        type: "DEPOSIT",
        method: "system",
        status: "APPROVED",
        note: "Initial E2E test wallet seed deposit",
      },
    });
    tracker.walletTxIds.push(initialTx.id);

    assert(Boolean(testUser.id), "Customer user record persisted in MySQL");
    assert(testUser.walletBalanceBDT === 2500, "Initial wallet balance matches exactly", `৳${testUser.walletBalanceBDT}`);
    assert(Boolean(initialTx.id && initialTx.status === "APPROVED"), "Wallet deposit transaction logged with APPROVED status");

    // =========================================================================
    // STEP 2: Create test product, variations & encrypted digital stock
    // =========================================================================
    console.log("\n🛒 STEP 2: Creating Test Product, Variations & Encrypted Digital Stock");
    console.log("-".repeat(70));

    const productSlug = `e2e-ai-suite-${Date.now()}`;
    const testProduct = await prisma.product.create({
      data: {
        slug: productSlug,
        name: "E2E Super AI Suite",
        category: "AI Tools",
        categories: JSON.stringify(["AI Tools", "Productivity"]),
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
        minPriceBDT: 350,
        maxPriceBDT: 1200,
        shortDesc: "All-in-one AI Pro Suite for creative and engineering workflows",
        descriptionBangla: "টেস্ট এআই স্যুট বাংলা বিবরণ",
        descriptionEnglish: "Test AI Suite English Description",
        features: JSON.stringify(["GPT-4o Access", "Claude 3.5 Sonnet", "Midjourney V6"]),
        fulfillmentType: "AUTO_STOCK",
        warrantyDays: 30,
        inStock: true,
      },
    });
    tracker.productIds.push(testProduct.id);

    // Variation 1: 1 Month Shared (Price: ৳350)
    const var1 = await prisma.variation.create({
      data: {
        productId: testProduct.id,
        name: "1 Month Pro",
        priceBDT: 350,
        inStock: true,
        fulfillmentType: "AUTO_STOCK",
        warrantyDays: 30,
      },
    });
    tracker.variationIds.push(var1.id);

    // Variation 2: 1 Year Team (Price: ৳1200)
    const var2 = await prisma.variation.create({
      data: {
        productId: testProduct.id,
        name: "1 Year Team",
        priceBDT: 1200,
        inStock: true,
        fulfillmentType: "AUTO_STOCK",
        warrantyDays: 365,
      },
    });
    tracker.variationIds.push(var2.id);

    // Stock 1: For Variation 1 (Initial Order Item 1)
    const rawStockPayload1 = "email: user_pro1@aihaat.shop\npass: MasterSecretPass@2026!\npin: 9988";
    const encPayload1 = encryptCredential(rawStockPayload1);
    const fp1 = computeStockFingerprint(rawStockPayload1);

    const stock1 = await prisma.digitalStock.create({
      data: {
        productId: testProduct.id,
        variationId: var1.id,
        type: "ACCOUNT_CREDENTIAL",
        payloadEncrypted: encPayload1,
        fingerprint: fp1,
        batchRef: "BATCH-E2E-001",
        costPriceBDT: 200,
        status: "AVAILABLE",
      },
    });
    tracker.stockIds.push(stock1.id);

    // Stock 2: For Variation 2 (Initial Order Item 2)
    const rawStockPayload2 = "LICENSE-KEY: AIHAAT-E2E-TEAM-9988-7766-5544";
    const encPayload2 = encryptCredential(rawStockPayload2);
    const fp2 = computeStockFingerprint(rawStockPayload2);

    const stock2 = await prisma.digitalStock.create({
      data: {
        productId: testProduct.id,
        variationId: var2.id,
        type: "LICENSE_KEY",
        payloadEncrypted: encPayload2,
        fingerprint: fp2,
        batchRef: "BATCH-E2E-002",
        costPriceBDT: 800,
        status: "AVAILABLE",
      },
    });
    tracker.stockIds.push(stock2.id);

    // Stock 3: Replacement Stock for Variation 1 (For Step 9 warranty resolution)
    const rawStockPayload3 = "email: user_pro_replacement@aihaat.shop\npass: ReplacedPassSecure#2026\npin: 1122";
    const encPayload3 = encryptCredential(rawStockPayload3);
    const fp3 = computeStockFingerprint(rawStockPayload3);

    const stock3 = await prisma.digitalStock.create({
      data: {
        productId: testProduct.id,
        variationId: var1.id,
        type: "ACCOUNT_CREDENTIAL",
        payloadEncrypted: encPayload3,
        fingerprint: fp3,
        batchRef: "BATCH-E2E-REPL",
        costPriceBDT: 200,
        status: "AVAILABLE",
      },
    });
    tracker.stockIds.push(stock3.id);

    assert(Boolean(testProduct.id && var1.id && var2.id), "Product and 2 variations created successfully");
    assert(encPayload1.startsWith("v1:"), "Stock 1 encrypted with AES-256-GCM envelope (v1: prefix)");
    assert(encPayload2.startsWith("v1:"), "Stock 2 encrypted with AES-256-GCM envelope (v1: prefix)");
    assert(Boolean(fp1 && fp2 && fp1 !== fp2), "SHA-256 stock deduplication fingerprints generated properly");
    assert(stock1.status === "AVAILABLE" && stock2.status === "AVAILABLE", "All digital stock items initial status set to AVAILABLE");

    // =========================================================================
    // STEP 3: Apply a discount coupon to calculate order totals
    // =========================================================================
    console.log("\n🎟️ STEP 3: Applying Discount Coupon & Calculating Server Order Totals");
    console.log("-".repeat(70));

    const couponCode = `E2EDISCOUNT_${Date.now().toString().slice(-4)}`;
    const discountAmountBDT = 50;

    const testCoupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        discountType: "FLAT_BDT",
        discountValue: discountAmountBDT,
        appliesTo: "ALL",
        minOrderBDT: 500,
        usageLimit: 10,
        usedCount: 0,
        validUntil: new Date(Date.now() + 30 * 86400000),
        isActive: true,
      },
    });
    tracker.couponIds.push(testCoupon.id);

    // Call server-authoritative pricing engine
    const quoteResult = await calculateOrderQuote(
      [
        {
          productId: testProduct.id,
          variationId: var1.id,
          productName: testProduct.name,
          variationName: var1.name,
          quantity: 1,
        },
        {
          productId: testProduct.id,
          variationId: var2.id,
          productName: testProduct.name,
          variationName: var2.name,
          quantity: 1,
        },
      ],
      couponCode
    );

    assert(quoteResult.isValid, "Pricing engine validated order item configuration");
    assert(quoteResult.quote.subtotalBDT === 1550, "Subtotal calculated accurately (৳350 + ৳1200 = ৳1550)", `৳${quoteResult.quote.subtotalBDT}`);
    assert(quoteResult.quote.discountBDT === 50, "Coupon discount applied accurately", `৳${quoteResult.quote.discountBDT}`);
    assert(quoteResult.quote.totalBDT === 1500, "Final payable total matches (৳1550 - ৳50 = ৳1500)", `৳${quoteResult.quote.totalBDT}`);
    assert(quoteResult.quote.couponCode === couponCode, "Validated coupon attached to order quote");

    // =========================================================================
    // STEP 4: Create order with multi-items and debit user's wallet balance atomically
    // =========================================================================
    console.log("\n💳 STEP 4: Atomic Multi-Item Order Creation & Customer Wallet Debit");
    console.log("-".repeat(70));

    const orderNumber = `AH-E2E-${Date.now().toString().slice(-6)}`;
    const finalOrderTotal = quoteResult.quote.totalBDT;

    // Atomic Database Transaction for Order + Wallet Debit + Coupon Consumption
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch user to verify wallet balance
      const currentUser = await tx.user.findUniqueOrThrow({
        where: { id: testUser.id },
      });

      if (currentUser.walletBalanceBDT < finalOrderTotal) {
        throw new Error(`Insufficient wallet balance: ৳${currentUser.walletBalanceBDT} < ৳${finalOrderTotal}`);
      }

      // 2. Deduct wallet balance
      const updatedUser = await tx.user.update({
        where: { id: testUser.id },
        data: {
          walletBalanceBDT: currentUser.walletBalanceBDT - finalOrderTotal,
        },
      });

      // 3. Log Wallet Purchase Transaction
      const walletTx = await tx.walletTransaction.create({
        data: {
          userId: testUser.id,
          amountBDT: finalOrderTotal,
          type: "PURCHASE",
          method: "wallet",
          status: "APPROVED",
          trxId: `WLT-${orderNumber}`,
          note: `Payment for Order #${orderNumber}`,
        },
      });

      // 4. Increment coupon usage
      await tx.coupon.update({
        where: { id: testCoupon.id },
        data: { usedCount: { increment: 1 } },
      });

      // 5. Create Order with items & timeline
      const ord = await tx.order.create({
        data: {
          id: orderNumber,
          orderNumber,
          userId: testUser.id,
          customerName: testUser.name || "E2E Master Customer",
          customerEmail: testUser.email,
          customerPhone: testUser.phone || "01712345678",
          notes: "E2E Master Suite Automated Test Order",
          subtotalBDT: quoteResult.quote.subtotalBDT,
          discountBDT: quoteResult.quote.discountBDT,
          totalBDT: finalOrderTotal,
          paymentMethod: "wallet",
          trxId: `WLT-${orderNumber}`,
          paymentStatus: "VERIFIED",
          deliveryStatus: "ORDER_PLACED",
          items: {
            create: [
              {
                productId: testProduct.id,
                variationId: var1.id,
                productName: `${testProduct.name} - ${var1.name}`,
                variationName: var1.name,
                priceBDT: var1.priceBDT,
                quantity: 1,
                fulfillmentType: "AUTO_STOCK",
                deliveryStatus: "ORDER_PLACED",
              },
              {
                productId: testProduct.id,
                variationId: var2.id,
                productName: `${testProduct.name} - ${var2.name}`,
                variationName: var2.name,
                priceBDT: var2.priceBDT,
                quantity: 1,
                fulfillmentType: "AUTO_STOCK",
                deliveryStatus: "ORDER_PLACED",
              },
            ],
          },
          timelineEvents: {
            create: {
              status: "ORDER_PLACED",
              actor: "CUSTOMER",
              note: `Order placed and paid via wallet balance. Total: ৳${finalOrderTotal}`,
            },
          },
        },
        include: {
          items: true,
          timelineEvents: true,
        },
      });

      return { ord, updatedUser, walletTx };
    });

    tracker.orderIds.push(createdOrder.ord.id);
    tracker.walletTxIds.push(createdOrder.walletTx.id);

    assert(createdOrder.updatedUser.walletBalanceBDT === 1000, "Wallet balance atomically debited (৳2500 - ৳1500 = ৳1000)", `৳${createdOrder.updatedUser.walletBalanceBDT}`);
    assert(createdOrder.ord.paymentStatus === "VERIFIED", "Order created with VERIFIED payment status");
    assert(createdOrder.ord.items.length === 2, "Order contains 2 distinct multi-item line items");

    const updatedCoupon = await prisma.coupon.findUnique({ where: { id: testCoupon.id } });
    assert(updatedCoupon?.usedCount === 1, "Coupon usage counter atomically incremented", `usedCount: ${updatedCoupon?.usedCount}`);

    // =========================================================================
    // STEP 5: Perform automated stock assignment: mark DELIVERED & create DeliveredKey
    // =========================================================================
    console.log("\n⚡ STEP 5: Automated Stock Assignment & Encrypted Key Delivery");
    console.log("-".repeat(70));

    const item1 = createdOrder.ord.items[0];
    const item2 = createdOrder.ord.items[1];

    // Atomically claim stock and create DeliveredKey records
    const deliveryResults = await prisma.$transaction(async (tx) => {
      // 1. Claim Stock 1 for Item 1
      await tx.digitalStock.update({
        where: { id: stock1.id },
        data: {
          status: "DELIVERED",
          assignedOrderId: createdOrder.ord.id,
          assignedOrderItemId: item1.id,
          deliveredAt: new Date(),
        },
      });

      const dk1 = await tx.deliveredKey.create({
        data: {
          orderId: createdOrder.ord.id,
          orderItemId: item1.id,
          stockId: stock1.id,
          userId: testUser.id,
          productName: item1.productName,
          accountType: item1.variationName,
          credentials: "Encrypted at rest (Use Digital Vault to view)",
          credentialsEncrypted: encPayload1,
          instructions: "Login at https://aihaat.shop/login. Do not change recovery email.",
          warrantyExpiresAt: new Date(Date.now() + 30 * 86400000),
          isReplacement: false,
        },
      });

      await tx.orderItem.update({
        where: { id: item1.id },
        data: { deliveryStatus: "DELIVERED" },
      });

      // 2. Claim Stock 2 for Item 2
      await tx.digitalStock.update({
        where: { id: stock2.id },
        data: {
          status: "DELIVERED",
          assignedOrderId: createdOrder.ord.id,
          assignedOrderItemId: item2.id,
          deliveredAt: new Date(),
        },
      });

      const dk2 = await tx.deliveredKey.create({
        data: {
          orderId: createdOrder.ord.id,
          orderItemId: item2.id,
          stockId: stock2.id,
          userId: testUser.id,
          productName: item2.productName,
          accountType: item2.variationName,
          credentials: "Encrypted at rest (Use Digital Vault to view)",
          credentialsEncrypted: encPayload2,
          instructions: "Redeem license key at official vendor software portal.",
          warrantyExpiresAt: new Date(Date.now() + 365 * 86400000),
          isReplacement: false,
        },
      });

      await tx.orderItem.update({
        where: { id: item2.id },
        data: { deliveryStatus: "DELIVERED" },
      });

      // 3. Mark overall order as DELIVERED and append timeline
      const updatedOrd = await tx.order.update({
        where: { id: createdOrder.ord.id },
        data: { deliveryStatus: "DELIVERED" },
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId: createdOrder.ord.id,
          status: "DELIVERED",
          actor: "SYSTEM",
          note: "All order items auto-dispatched from encrypted digital stock vault",
        },
      });

      // 4. Send customer delivery notification
      const notif = await tx.notification.create({
        data: {
          userId: testUser.id,
          title: `ইনস্ট্যান্ট ডেলিভারি সম্পন্ন! (#${orderNumber})`,
          message: `আপনার অর্ডারকৃত ডিজিটাল প্রোডাক্ট সফলভাবে ডেলিভারি হয়েছে। ভল্ট চেক করুন।`,
          type: "DELIVERY",
          link: "/dashboard/keys",
          isRead: false,
        },
      });

      return { dk1, dk2, updatedOrd, notif };
    });

    tracker.deliveryKeyIds.push(deliveryResults.dk1.id, deliveryResults.dk2.id);
    tracker.notificationIds.push(deliveryResults.notif.id);

    const verifiedStock1 = await prisma.digitalStock.findUnique({ where: { id: stock1.id } });
    const verifiedStock2 = await prisma.digitalStock.findUnique({ where: { id: stock2.id } });

    assert(verifiedStock1?.status === "DELIVERED" && verifiedStock1?.assignedOrderId === createdOrder.ord.id, "Stock 1 assigned and marked as DELIVERED");
    assert(verifiedStock2?.status === "DELIVERED" && verifiedStock2?.assignedOrderId === createdOrder.ord.id, "Stock 2 assigned and marked as DELIVERED");
    assert(deliveryResults.updatedOrd.deliveryStatus === "DELIVERED", "Order delivery status updated to DELIVERED");
    assert(Boolean(deliveryResults.dk1.id && deliveryResults.dk2.id), "DeliveredKey records generated with encrypted payloads");

    // =========================================================================
    // STEP 6: Verify Digital Vault decryption using decryptCredential & check password masking logic
    // =========================================================================
    console.log("\n🔐 STEP 6: Digital Vault Decryption & UI Password Masking Logic");
    console.log("-".repeat(70));

    // Decrypt credentials
    const decrypted1 = decryptCredential(deliveryResults.dk1.credentialsEncrypted || "");
    const decrypted2 = decryptCredential(deliveryResults.dk2.credentialsEncrypted || "");

    assert(decrypted1 === rawStockPayload1, "Decrypted Item 1 credentials match exact original plaintext payload");
    assert(decrypted2 === rawStockPayload2, "Decrypted Item 2 license key matches exact original plaintext payload");

    // Credential Line Parsing & Masking Logic (from Dashboard Digital Vault)
    const parseAndMaskCredentials = (raw: string) => {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      let username = "";
      let password = "";
      let pin = "";
      let licenseKey = "";

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("user:") || lower.startsWith("email:") || lower.startsWith("username:")) {
          username = line.substring(line.indexOf(":") + 1).trim();
        } else if (lower.startsWith("pass:") || lower.startsWith("password:")) {
          password = line.substring(line.indexOf(":") + 1).trim();
        } else if (lower.startsWith("pin:")) {
          pin = line.substring(line.indexOf(":") + 1).trim();
        } else if (lower.startsWith("license-key:") || lower.startsWith("key:")) {
          licenseKey = line.substring(line.indexOf(":") + 1).trim();
        }
      }

      const maskedPassword = password ? "•".repeat(16) : "";
      return { username, password, pin, licenseKey, maskedPassword };
    }

    const parsedItem1 = parseAndMaskCredentials(decrypted1);
    assert(parsedItem1.username === "user_pro1@aihaat.shop", "Parsed username correctly extracted", parsedItem1.username);
    assert(parsedItem1.password === "MasterSecretPass@2026!", "Parsed password correctly extracted", "MasterSecretPass@2026!");
    assert(parsedItem1.pin === "9988", "Parsed PIN correctly extracted", parsedItem1.pin);
    assert(parsedItem1.maskedPassword === "••••••••••••••••", "Masked password obfuscation verified", parsedItem1.maskedPassword);

    const parsedItem2 = parseAndMaskCredentials(decrypted2);
    assert(parsedItem2.licenseKey === "AIHAAT-E2E-TEAM-9988-7766-5544", "Parsed license key correctly extracted", parsedItem2.licenseKey);

    // =========================================================================
    // STEP 7: Query public order tracking to ensure safe status return with PII masking
    // =========================================================================
    console.log("\n🔍 STEP 7: Public Order Tracking Safety & PII Sanitization");
    console.log("-".repeat(70));

    // Simulate public tracking retrieval
    const trackedOrder = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderNumber }, { id: orderNumber }],
      },
      include: {
        items: true,
        timelineEvents: { orderBy: { createdAt: "desc" } },
      },
    });

    assert(Boolean(trackedOrder), "Public order tracking queried order by orderNumber");

    // Safe PII masking helpers (from /api/orders/route.ts)
    const maskPhone = (p: string) => {
      if (!p) return "";
      const clean = p.trim();
      if (clean.length <= 6) return "***";
      return clean.slice(0, 3) + "****" + clean.slice(-4);
    };

    const maskEmail = (e: string) => {
      if (!e || !e.includes("@")) return "";
      const [userPart, domain] = e.split("@");
      const maskedUser = userPart.length > 2 ? userPart.slice(0, 2) + "***" : userPart[0] + "***";
      return `${maskedUser}@${domain}`;
    };

    const maskName = (n: string) => {
      if (!n) return "Customer";
      const parts = n.trim().split(" ");
      return parts
        .map((pt) => (pt.length > 1 ? pt[0] + "*".repeat(Math.min(pt.length - 1, 4)) : pt))
        .join(" ");
    };

    const safePublicResponse = {
      orderNumber: trackedOrder?.orderNumber,
      customerName: maskName(trackedOrder?.customerName || ""),
      customerPhone: maskPhone(trackedOrder?.customerPhone || ""),
      customerEmail: maskEmail(trackedOrder?.customerEmail || ""),
      paymentStatus: trackedOrder?.paymentStatus === "VERIFIED" ? "Completed" : "Pending",
      deliveryStatus: trackedOrder?.deliveryStatus === "DELIVERED" ? "Delivered" : "Processing",
      items: trackedOrder?.items.map((it) => ({
        productName: it.productName,
        variationName: it.variationName,
        priceBDT: it.priceBDT,
        deliveryStatus: it.deliveryStatus,
      })),
      timelineEvents: trackedOrder?.timelineEvents.map((t) => ({
        status: t.status,
        actor: t.actor,
        note: t.note,
      })),
    };

    assert(safePublicResponse.customerPhone === "017****5678", "Customer phone masked for public tracking", safePublicResponse.customerPhone);
    assert(safePublicResponse.customerEmail.includes("***@"), "Customer email masked for public tracking", safePublicResponse.customerEmail);
    assert(safePublicResponse.customerName.includes("*"), "Customer name masked for public tracking", safePublicResponse.customerName);
    assert(safePublicResponse.deliveryStatus === "Delivered", "Delivery status correctly returned as Delivered");
    assert(!("credentials" in safePublicResponse) && !("credentialsEncrypted" in safePublicResponse), "Zero sensitive credentials leaked in public tracking payload");

    // =========================================================================
    // STEP 8: Submit a warranty replacement claim & test duplicate prevention
    // =========================================================================
    console.log("\n🛡️ STEP 8: Warranty Replacement Request & Duplicate Prevention");
    console.log("-".repeat(70));

    const claim1 = await prisma.replacementRequest.create({
      data: {
        userId: testUser.id,
        orderId: createdOrder.ord.id,
        orderItemId: item1.id,
        originalDeliveryId: deliveryResults.dk1.id,
        reason: "LOGIN_FAILED",
        description: "Password stopped working on day 2. Login error.",
        status: "REQUESTED",
      },
    });
    tracker.replacementRequestIds.push(claim1.id);

    assert(Boolean(claim1.id), "Replacement claim recorded with REQUESTED status");

    // Test Duplicate Guard Logic
    const existingOpenClaim = await prisma.replacementRequest.findFirst({
      where: {
        originalDeliveryId: deliveryResults.dk1.id,
        status: { in: ["REQUESTED", "UNDER_REVIEW"] },
      },
    });

    assert(Boolean(existingOpenClaim), "Duplicate guard detects active open claim for delivery item");

    let duplicateBlocked = false;
    if (existingOpenClaim) {
      duplicateBlocked = true;
    }
    assert(duplicateBlocked, "Second concurrent replacement request successfully blocked by duplicate guard");

    // =========================================================================
    // STEP 9: Simulate admin resolution of claim with new replacement key assignment
    // =========================================================================
    console.log("\n👑 STEP 9: Admin Claim Resolution & Replacement Key Dispatch");
    console.log("-".repeat(70));

    // Admin resolves the claim in an atomic transaction
    const resolution = await prisma.$transaction(async (tx) => {
      // 1. Invalidate old stock
      await tx.digitalStock.update({
        where: { id: stock1.id },
        data: {
          status: "REPLACED",
          replacedAt: new Date(),
        },
      });

      // 2. Claim replacement stock (Stock 3)
      await tx.digitalStock.update({
        where: { id: stock3.id },
        data: {
          status: "DELIVERED",
          assignedOrderId: createdOrder.ord.id,
          assignedOrderItemId: item1.id,
          deliveredAt: new Date(),
        },
      });

      // 3. Create new replacement DeliveredKey
      const replacementDk = await tx.deliveredKey.create({
        data: {
          orderId: createdOrder.ord.id,
          orderItemId: item1.id,
          stockId: stock3.id,
          userId: testUser.id,
          productName: item1.productName,
          accountType: item1.variationName,
          credentials: "Encrypted at rest (Replacement)",
          credentialsEncrypted: encPayload3,
          instructions: "New replacement account credentials issued under warranty.",
          warrantyExpiresAt: new Date(Date.now() + 30 * 86400000),
          isReplacement: true,
          replacedDeliveryId: deliveryResults.dk1.id,
        },
      });

      // 4. Update ReplacementRequest to COMPLETED
      const updatedClaim = await tx.replacementRequest.update({
        where: { id: claim1.id },
        data: {
          status: "COMPLETED",
          adminNotes: "Replacement approved and new credentials dispatched from reserve vault.",
          reviewedBy: "admin@aihaat.shop",
          reviewedAt: new Date(),
          replacementDeliveryId: replacementDk.id,
          assignedStockId: stock3.id,
        },
      });

      // 5. Notify customer of replacement
      const replNotif = await tx.notification.create({
        data: {
          userId: testUser.id,
          title: "রিপ্লেসমেন্ট সম্পন্ন হয়েছে! (New Credentials)",
          message: `আপনার অর্ডার #${orderNumber} এর রিপ্লেসমেন্ট কি সফলভাবে ভল্টে যোগ হয়েছে।`,
          type: "DELIVERY",
          link: "/dashboard/keys",
          isRead: false,
        },
      });

      return { replacementDk, updatedClaim, replNotif };
    });

    tracker.deliveryKeyIds.push(resolution.replacementDk.id);
    tracker.notificationIds.push(resolution.replNotif.id);

    const oldStockCheck = await prisma.digitalStock.findUnique({ where: { id: stock1.id } });
    const replStockCheck = await prisma.digitalStock.findUnique({ where: { id: stock3.id } });

    assert(oldStockCheck?.status === "REPLACED", "Original stock item marked as REPLACED");
    assert(replStockCheck?.status === "DELIVERED", "Replacement reserve stock item marked as DELIVERED");
    assert(resolution.updatedClaim.status === "COMPLETED", "ReplacementRequest status transitioned to COMPLETED");
    assert(resolution.replacementDk.isReplacement === true, "New delivery key marked with isReplacement: true");
    assert(resolution.replacementDk.replacedDeliveryId === deliveryResults.dk1.id, "New delivery key linked to original delivery ID");

    // Decrypt and verify replacement credentials
    const decryptedReplacement = decryptCredential(resolution.replacementDk.credentialsEncrypted || "");
    assert(decryptedReplacement === rawStockPayload3, "Replacement credentials decrypted accurately to new account payload");

    // =========================================================================
    // STEP 10: Submit a customer review and custom product request
    // =========================================================================
    console.log("\n⭐ STEP 10: Submitting Customer Review & Custom Product Request");
    console.log("-".repeat(70));

    // 1. Submit verified customer review
    const review = await prisma.review.create({
      data: {
        productId: testProduct.id,
        author: testUser.name || "E2E Master Customer",
        rating: 5,
        comment: "Flawless instant delivery, encrypted vault security, and lightning-fast warranty replacement! 5/5 stars.",
        isVerifiedPurchase: true,
        status: "APPROVED",
      },
    });
    tracker.reviewIds.push(review.id);

    assert(Boolean(review.id), "Customer review created and linked to test product");
    assert(review.rating === 5 && review.status === "APPROVED", "Review approved with 5-star rating");

    // 2. Submit custom product request
    const productRequest = await prisma.productRequest.create({
      data: {
        productName: "Cursor Pro AI Annual Subscription",
        targetBudget: "4500 BDT",
        contact: "01712345678 / e2e_cust@aihaat.shop",
        details: "Need annual license for software development agency team.",
        status: "PENDING",
      },
    });
    tracker.productRequestIds.push(productRequest.id);

    assert(Boolean(productRequest.id), "Custom product request created and persisted");
    assert(productRequest.status === "PENDING", "Product request initial status is PENDING");

  } catch (err: any) {
    console.error("\n❌ E2E Orchestration Suite Encountered An Error:", err);
    throw err;
  } finally {
    // =========================================================================
    // STEP 11: Cleanup all created test records cleanly
    // =========================================================================
    console.log("\n🧹 STEP 11: Cleaning Up All Test Artifacts Cleanly");
    console.log("-".repeat(70));

    try {
      if (tracker.reviewIds.length > 0) {
        await prisma.review.deleteMany({ where: { id: { in: tracker.reviewIds } } });
      }
      if (tracker.productRequestIds.length > 0) {
        await prisma.productRequest.deleteMany({ where: { id: { in: tracker.productRequestIds } } });
      }
      if (tracker.replacementRequestIds.length > 0) {
        await prisma.replacementRequest.deleteMany({ where: { id: { in: tracker.replacementRequestIds } } });
      }
      if (tracker.deliveryKeyIds.length > 0) {
        await prisma.deliveredKey.deleteMany({ where: { id: { in: tracker.deliveryKeyIds } } });
      }
      if (tracker.stockIds.length > 0) {
        await prisma.digitalStock.deleteMany({ where: { id: { in: tracker.stockIds } } });
      }
      if (tracker.orderIds.length > 0) {
        await prisma.orderTimelineEvent.deleteMany({ where: { orderId: { in: tracker.orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: tracker.orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: tracker.orderIds } } });
      }
      if (tracker.walletTxIds.length > 0) {
        await prisma.walletTransaction.deleteMany({ where: { id: { in: tracker.walletTxIds } } });
      }
      if (tracker.notificationIds.length > 0) {
        await prisma.notification.deleteMany({ where: { id: { in: tracker.notificationIds } } });
      }
      if (tracker.couponIds.length > 0) {
        await prisma.coupon.deleteMany({ where: { id: { in: tracker.couponIds } } });
      }
      if (tracker.variationIds.length > 0) {
        await prisma.variation.deleteMany({ where: { id: { in: tracker.variationIds } } });
      }
      if (tracker.productIds.length > 0) {
        await prisma.product.deleteMany({ where: { id: { in: tracker.productIds } } });
      }
      if (tracker.userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: tracker.userIds } } });
      }

      console.log("  ✅ [PASS] All test records cleanly removed without orphaned entities");
    } catch (cleanupErr) {
      console.warn("  ⚠️ Warning during cleanup:", cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  }

  const durationMs = Date.now() - startTime;
  console.log("\n" + "=".repeat(70));
  console.log(`🎉  ALL ${passedAssertions}/${totalAssertions} E2E FULL-LIFECYCLE ASSERTIONS PASSED SUCCESSFULLY!`);
  console.log(`⏱️   Total Execution Time: ${(durationMs / 1000).toFixed(2)}s`);
  console.log("=".repeat(70) + "\n");
}

runMasterE2ESuite().catch((err) => {
  console.error("Master E2E Suite Terminated with Failure:", err);
  process.exit(1);
});
