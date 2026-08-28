import { prisma } from "../src/lib/prisma";
import { resolveProductConfiguration, parseDurationToDays, validateProductInvariants } from "../src/lib/commerce/resolver";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";
import { calculateWarrantyStatus, calculateCustomerEntitlementStatus, calculateRefundEligibility, calculateReplacementEligibility } from "../src/lib/commerce/warranty";
import { dispatchOrderItemFulfillment } from "../src/lib/commerce/fulfillment-handlers";
import { addStockItem, claimAvailableStock } from "../src/lib/commerce/inventory";
import { toPublicProductSummaryDTO, toPublicProductDetailDTO } from "../src/lib/commerce/dto";
import { encryptCredential, decryptCredential } from "../src/lib/mfa/crypto";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("=================================================");
  console.log("  AI HAAT — PRODUCT DOMAIN MASTER INTEGRATION SUITE");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const testCategory = "TEST_CATEGORY";

  // --------------------------------------------------------------------------
  // TEST A: Subscription + Account Credential + Auto Stock
  // --------------------------------------------------------------------------
  console.log("--- TEST A: SUBSCRIPTION + AUTO_STOCK ---");
  const subProduct = await prisma.product.create({
    data: {
      id: `test-prod-sub-${timestamp}`,
      slug: `test-chatgpt-${timestamp}`,
      name: "ChatGPT Plus Test",
      category: testCategory,
      image: "/images/test.svg",
      minPriceBDT: 290,
      maxPriceBDT: 290,
      regularPriceBDT: 290,
      shortDesc: "Test subscription",
      descriptionBangla: "টেস্ট",
      descriptionEnglish: "Test",
      features: JSON.stringify(["Full Warranty", "Instant Access"]),
      productType: "SUBSCRIPTION",
      fulfillmentType: "AUTO_STOCK",
      warrantyDays: 30,
      variations: {
        create: [
          {
            id: `test-var-sub-${timestamp}`,
            name: "1 Month - Shared",
            priceBDT: 290,
            regularPriceBDT: 290,
            duration: "1 Month",
            inStock: true,
          },
        ],
      },
    },
    include: { variations: true },
  });

  const resolvedSub = resolveProductConfiguration(subProduct, subProduct.variations[0]);
  assert(resolvedSub.productType === "SUBSCRIPTION", "Resolved productType is SUBSCRIPTION");
  assert(resolvedSub.fulfillmentType === "AUTO_STOCK", "Resolved fulfillmentType is AUTO_STOCK");
  assert(resolvedSub.durationDays === 30, "Resolved durationDays is 30 for '1 Month'");
  assert(resolvedSub.warrantyDays === 30, "Resolved warrantyDays is 30");

  // Add stock
  const stockSub = await addStockItem({
    productId: subProduct.id,
    variationId: subProduct.variations[0].id,
    type: "ACCOUNT_CREDENTIAL",
    payload: `user_${timestamp}@openai.com:pass1234`,
  });
  assert(stockSub.status === "AVAILABLE", "Added stock item with status AVAILABLE");

  // Create Order & Fulfill
  const orderSub = await prisma.order.create({
    data: {
      id: `TEST-ORD-SUB-${timestamp}`,
      orderNumber: `TEST-ORD-SUB-${timestamp}`,
      customerName: "Test Sub Customer",
      customerEmail: "sub_test@aihaat.shop",
      customerPhone: "01700000001",
      subtotalBDT: 290,
      totalBDT: 290,
      paymentMethod: "bKash",
      paymentStatus: "VERIFIED",
      items: {
        create: {
          id: `test-item-sub-${timestamp}`,
          productId: subProduct.id,
          variationId: subProduct.variations[0].id,
          productName: subProduct.name,
          variationName: subProduct.variations[0].name,
          priceBDT: 290,
          quantity: 1,
          fulfillmentType: "AUTO_STOCK",
          warrantyDaysAtPurchase: 30,
        },
      },
    },
    include: { items: true },
  });

  const fulfillmentResultSub = await prisma.$transaction(async (tx) => {
    return dispatchOrderItemFulfillment(tx, "AUTO_STOCK", {
      orderId: orderSub.id,
      orderNumber: orderSub.orderNumber,
      orderItemId: orderSub.items[0].id,
      productId: subProduct.id,
      variationId: subProduct.variations[0].id,
      productName: subProduct.name,
      variationName: subProduct.variations[0].name,
      quantity: 1,
      userId: null,
      customerEmail: orderSub.customerEmail,
      customerName: orderSub.customerName,
      warrantyDays: 30,
      durationDays: 30,
    });
  });

  assert(fulfillmentResultSub.success === true, "Auto stock fulfillment succeeded");
  assert(fulfillmentResultSub.deliveryStatus === "DELIVERED", "Delivery status is DELIVERED");
  assert(fulfillmentResultSub.deliveredKeys.length === 1, "Delivered exactly 1 key");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST B: License Key + Auto Stock
  // --------------------------------------------------------------------------
  console.log("--- TEST B: LICENSE_KEY + AUTO_STOCK ---");
  const licProduct = await prisma.product.create({
    data: {
      id: `test-prod-lic-${timestamp}`,
      slug: `test-win11-${timestamp}`,
      name: "Windows 11 Pro Retail",
      category: testCategory,
      image: "/images/test.svg",
      minPriceBDT: 450,
      maxPriceBDT: 450,
      regularPriceBDT: 450,
      shortDesc: "Retail license",
      descriptionBangla: "লাইসেন্স",
      descriptionEnglish: "License",
      features: JSON.stringify(["Lifetime Validity", "Online Activation"]),
      productType: "LICENSE_KEY",
      fulfillmentType: "AUTO_STOCK",
      warrantyDays: 365,
      variations: {
        create: [
          {
            id: `test-var-lic-${timestamp}`,
            name: "1 PC - Lifetime",
            priceBDT: 450,
            regularPriceBDT: 450,
            duration: "Lifetime",
            inStock: true,
          },
        ],
      },
    },
    include: { variations: true },
  });

  const resolvedLic = resolveProductConfiguration(licProduct, licProduct.variations[0]);
  assert(resolvedLic.productType === "LICENSE_KEY", "Resolved productType is LICENSE_KEY");
  assert(resolvedLic.durationDays === 36500, "Resolved durationDays is 36500 for Lifetime");

  await addStockItem({
    productId: licProduct.id,
    variationId: licProduct.variations[0].id,
    type: "LICENSE_KEY",
    payload: `W269N-WFGWX-YVC9B-4J6C9-T83GX-${timestamp}`,
  });

  const orderLic = await prisma.order.create({
    data: {
      id: `TEST-ORD-LIC-${timestamp}`,
      orderNumber: `TEST-ORD-LIC-${timestamp}`,
      customerName: "Test License Customer",
      customerEmail: "lic_test@aihaat.shop",
      customerPhone: "01700000002",
      subtotalBDT: 450,
      totalBDT: 450,
      paymentMethod: "Nagad",
      paymentStatus: "VERIFIED",
      items: {
        create: {
          id: `test-item-lic-${timestamp}`,
          productId: licProduct.id,
          variationId: licProduct.variations[0].id,
          productName: licProduct.name,
          variationName: licProduct.variations[0].name,
          priceBDT: 450,
          quantity: 1,
          fulfillmentType: "AUTO_STOCK",
          warrantyDaysAtPurchase: 365,
        },
      },
    },
    include: { items: true },
  });

  const fulfillmentResultLic = await prisma.$transaction(async (tx) => {
    return dispatchOrderItemFulfillment(tx, "AUTO_STOCK", {
      orderId: orderLic.id,
      orderNumber: orderLic.orderNumber,
      orderItemId: orderLic.items[0].id,
      productId: licProduct.id,
      variationId: licProduct.variations[0].id,
      productName: licProduct.name,
      variationName: licProduct.variations[0].name,
      quantity: 1,
      userId: null,
      customerEmail: orderLic.customerEmail,
      customerName: orderLic.customerName,
      warrantyDays: 365,
      durationDays: 36500,
    });
  });

  assert(fulfillmentResultLic.success === true, "License key auto-fulfillment succeeded");
  assert(fulfillmentResultLic.deliveredKeys[0].credentialsPlaintext.includes("W269N"), "Delivered key contains expected license prefix");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST C: Workspace Access + Manual Fulfillment
  // --------------------------------------------------------------------------
  console.log("--- TEST C: WORKSPACE_ACCESS + MANUAL ---");
  const wsProduct = await prisma.product.create({
    data: {
      id: `test-prod-ws-${timestamp}`,
      slug: `test-lovable-ws-${timestamp}`,
      name: "Lovable Workspace Seat",
      category: testCategory,
      image: "/images/test.svg",
      minPriceBDT: 1200,
      maxPriceBDT: 1200,
      regularPriceBDT: 1200,
      shortDesc: "Workspace seat",
      descriptionBangla: "ওয়ার্কস্পেস",
      descriptionEnglish: "Workspace",
      features: JSON.stringify(["Team Seat", "Fast Turnaround"]),
      productType: "WORKSPACE_ACCESS",
      fulfillmentType: "MANUAL",
      warrantyDays: 30,
      variations: {
        create: [
          {
            id: `test-var-ws-${timestamp}`,
            name: "1 Month Seat",
            priceBDT: 1200,
            regularPriceBDT: 1200,
            duration: "1 Month",
            inStock: true,
          },
        ],
      },
    },
    include: { variations: true },
  });

  const resolvedWs = resolveProductConfiguration(wsProduct, wsProduct.variations[0]);
  assert(resolvedWs.fulfillmentType === "MANUAL", "Resolved fulfillmentType is MANUAL");
  assert(resolvedWs.requiresInventory === false, "requiresInventory is false for MANUAL");

  const orderWs = await prisma.order.create({
    data: {
      id: `TEST-ORD-WS-${timestamp}`,
      orderNumber: `TEST-ORD-WS-${timestamp}`,
      customerName: "Test WS Customer",
      customerEmail: "ws_test@aihaat.shop",
      customerPhone: "01700000003",
      subtotalBDT: 1200,
      totalBDT: 1200,
      paymentMethod: "bKash",
      paymentStatus: "VERIFIED",
      items: {
        create: {
          id: `test-item-ws-${timestamp}`,
          productId: wsProduct.id,
          variationId: wsProduct.variations[0].id,
          productName: wsProduct.name,
          variationName: wsProduct.variations[0].name,
          priceBDT: 1200,
          quantity: 1,
          fulfillmentType: "MANUAL",
          warrantyDaysAtPurchase: 30,
        },
      },
    },
    include: { items: true },
  });

  const fulfillmentResultWs = await prisma.$transaction(async (tx) => {
    return dispatchOrderItemFulfillment(tx, "MANUAL", {
      orderId: orderWs.id,
      orderNumber: orderWs.orderNumber,
      orderItemId: orderWs.items[0].id,
      productId: wsProduct.id,
      variationId: wsProduct.variations[0].id,
      productName: wsProduct.name,
      variationName: wsProduct.variations[0].name,
      quantity: 1,
      userId: null,
      customerEmail: orderWs.customerEmail,
      customerName: orderWs.customerName,
      warrantyDays: 30,
      durationDays: 30,
    });
  });

  assert(fulfillmentResultWs.deliveryStatus === "PROCESSING", "Manual fulfillment sets status to PROCESSING for admin dispatch");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST D: Protected Download
  // --------------------------------------------------------------------------
  console.log("--- TEST D: DOWNLOAD + PROTECTED_DOWNLOAD ---");
  const dlProduct = await prisma.product.create({
    data: {
      id: `test-prod-dl-${timestamp}`,
      slug: `test-asset-pack-${timestamp}`,
      name: "UI Asset Bundle",
      category: testCategory,
      image: "/images/test.svg",
      minPriceBDT: 250,
      maxPriceBDT: 250,
      regularPriceBDT: 250,
      shortDesc: "UI assets",
      descriptionBangla: "ডাউনলোড",
      descriptionEnglish: "Download",
      features: JSON.stringify(["Instant ZIP Download", "Lifetime Access"]),
      productType: "DOWNLOAD",
      fulfillmentType: "PROTECTED_DOWNLOAD",
      warrantyDays: 30,
    },
  });

  const orderDl = await prisma.order.create({
    data: {
      id: `TEST-ORD-DL-${timestamp}`,
      orderNumber: `TEST-ORD-DL-${timestamp}`,
      customerName: "Test DL Customer",
      customerEmail: "dl_test@aihaat.shop",
      customerPhone: "01700000004",
      subtotalBDT: 250,
      totalBDT: 250,
      paymentMethod: "wallet",
      paymentStatus: "VERIFIED",
      items: {
        create: {
          id: `test-item-dl-${timestamp}`,
          productId: dlProduct.id,
          productName: dlProduct.name,
          variationName: "Asset Bundle",
          priceBDT: 250,
          quantity: 1,
          fulfillmentType: "PROTECTED_DOWNLOAD",
          warrantyDaysAtPurchase: 30,
        },
      },
    },
    include: { items: true },
  });

  const fulfillmentResultDl = await prisma.$transaction(async (tx) => {
    return dispatchOrderItemFulfillment(tx, "PROTECTED_DOWNLOAD", {
      orderId: orderDl.id,
      orderNumber: orderDl.orderNumber,
      orderItemId: orderDl.items[0].id,
      productId: dlProduct.id,
      variationId: null,
      productName: dlProduct.name,
      variationName: "Asset Bundle",
      quantity: 1,
      userId: null,
      customerEmail: orderDl.customerEmail,
      customerName: orderDl.customerName,
      warrantyDays: 30,
      durationDays: null,
      downloadUrl: "https://aihaat.shop/vault/download/ui-bundle-v1.zip",
    });
  });

  assert(fulfillmentResultDl.deliveryStatus === "DELIVERED", "Protected download delivered immediately");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST E: Historical Price Invariant
  // --------------------------------------------------------------------------
  console.log("--- TEST E: HISTORICAL PRICE INVARIANT ---");
  // Update subProduct price from 290 to 700
  await prisma.product.update({
    where: { id: subProduct.id },
    data: { minPriceBDT: 700, regularPriceBDT: 700 },
  });
  await prisma.variation.update({
    where: { id: subProduct.variations[0].id },
    data: { priceBDT: 700, regularPriceBDT: 700 },
  });

  // Verify old OrderItem still has priceBDT = 290
  const pastOrderItem = await prisma.orderItem.findUnique({
    where: { id: orderSub.items[0].id },
  });
  assert(pastOrderItem?.priceBDT === 290, "Past OrderItem retains immutable purchase price of ৳290 despite product price increase to ৳700");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST F: Variation Override Invariant
  // --------------------------------------------------------------------------
  console.log("--- TEST F: VARIATION OVERRIDE INVARIANT ---");
  const overrideProduct = {
    id: "prod-override",
    slug: "prod-override",
    name: "Override Product",
    productType: "SUBSCRIPTION",
    fulfillmentType: "AUTO_STOCK",
    warrantyDays: 7, // Product default 7d
    regularPriceBDT: 500,
  };
  const overrideVariation = {
    id: "var-override",
    name: "30 Day Plan",
    priceBDT: 500,
    warrantyDays: 30, // Variation overrides with 30d
    fulfillmentType: "MANUAL", // Variation overrides with MANUAL
  };
  const resolvedOverride = resolveProductConfiguration(overrideProduct, overrideVariation);
  assert(resolvedOverride.warrantyDays === 30, "Resolved warranty is 30 days (overridden by variation)");
  assert(resolvedOverride.fulfillmentType === "MANUAL", "Resolved fulfillment is MANUAL (overridden by variation)");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST G: Invalid Product Config Validation
  // --------------------------------------------------------------------------
  console.log("--- TEST G: INVALID PRODUCT CONFIG VALIDATION ---");
  const invalidResult1 = validateProductInvariants({
    name: "", // Empty name
    variations: [{ name: "Var 1", priceBDT: 0 }],
  });
  assert(invalidResult1.isValid === false, "Rejects empty product name and 0 price");

  const invalidResult2 = validateProductInvariants({
    name: "Valid Product",
    variations: [{ name: "Var 1", regularPriceBDT: 500, salePriceBDT: 600 }], // sale price > regular price
  });
  assert(invalidResult2.isValid === false, "Rejects sale price greater than regular price");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST H: Single Stock Assignment Concurrency
  // --------------------------------------------------------------------------
  console.log("--- TEST H: SINGLE STOCK ASSIGNMENT CONCURRENCY ---");
  const singleStock = await addStockItem({
    productId: subProduct.id,
    variationId: subProduct.variations[0].id,
    type: "ACCOUNT_CREDENTIAL",
    payload: `single_unit_${timestamp}@test.com:secret`,
  });

  const orderRace1 = await prisma.order.create({
    data: {
      id: `TEST-RACE-1-${timestamp}`,
      orderNumber: `TEST-RACE-1-${timestamp}`,
      customerName: "Race Customer 1",
      customerEmail: "race1@aihaat.shop",
      customerPhone: "01700000010",
      subtotalBDT: 290,
      totalBDT: 290,
      paymentMethod: "bKash",
      paymentStatus: "VERIFIED",
    },
  });

  const orderRace2 = await prisma.order.create({
    data: {
      id: `TEST-RACE-2-${timestamp}`,
      orderNumber: `TEST-RACE-2-${timestamp}`,
      customerName: "Race Customer 2",
      customerEmail: "race2@aihaat.shop",
      customerPhone: "01700000020",
      subtotalBDT: 290,
      totalBDT: 290,
      paymentMethod: "Nagad",
      paymentStatus: "VERIFIED",
    },
  });

  let claim1: any = null;
  let claim2: any = null;

  await prisma.$transaction(async (tx) => {
    claim1 = await claimAvailableStock(tx, subProduct.id, subProduct.variations[0].id, orderRace1.id);
    claim2 = await claimAvailableStock(tx, subProduct.id, subProduct.variations[0].id, orderRace2.id);
  });

  assert(claim1 !== null, "First buyer successfully claimed the single stock item");
  assert(claim2 === null, "Second buyer failed to claim already-assigned stock item (No double selling)");

  await prisma.order.deleteMany({
    where: { id: { in: [orderRace1.id, orderRace2.id] } },
  });
  console.log("");

  // --------------------------------------------------------------------------
  // TEST I: Replacement Workflow & Warranty Preservation
  // --------------------------------------------------------------------------
  console.log("--- TEST I: REPLACEMENT WORKFLOW ---");
  const origDelivery = await prisma.deliveredKey.findFirst({
    where: { orderId: orderSub.id },
  });

  assert(origDelivery !== null, "Found original delivered key");

  const repEligibility = calculateReplacementEligibility(
    {
      warrantyExpiresAt: origDelivery?.warrantyExpiresAt,
      isReplacement: false,
      replacementsAsOriginal: [],
    },
    {
      isRefunded: false,
      replacementAllowedAtPurchase: true,
    }
  );
  assert(repEligibility.isEligible === true, "Item is eligible for warranty replacement");
  console.log("");

  // --------------------------------------------------------------------------
  // TEST J: Public DTO Privacy (No Internal Leaks)
  // --------------------------------------------------------------------------
  console.log("--- TEST J: PUBLIC DTO PRIVACY ---");
  const publicSummary = toPublicProductSummaryDTO({
    id: "p1",
    name: "Claude Pro",
    slug: "claude-pro",
    category: "AI Tools",
    productType: "SUBSCRIPTION",
    fulfillmentType: "AUTO_STOCK",
    minPriceBDT: 2500,
    costPriceBDT: 1800, // Should NOT be leaked
    variations: [{ id: "v1", name: "1 Month", priceBDT: 2500, inStock: true }],
  });

  assert((publicSummary as any).costPriceBDT === undefined, "Public DTO does not leak costPriceBDT");
  assert((publicSummary as any).fingerprint === undefined, "Public DTO does not leak fingerprint");
  console.log("");

  // --------------------------------------------------------------------------
  // CLEANUP TEST DATA
  // --------------------------------------------------------------------------
  console.log("--- CLEANING UP TEST DATA ---");
  await prisma.deliveredKey.deleteMany({
    where: { orderId: { in: [orderSub.id, orderLic.id, orderWs.id, orderDl.id] } },
  });
  await prisma.orderItem.deleteMany({
    where: { orderId: { in: [orderSub.id, orderLic.id, orderWs.id, orderDl.id] } },
  });
  await prisma.order.deleteMany({
    where: { id: { in: [orderSub.id, orderLic.id, orderWs.id, orderDl.id] } },
  });
  await prisma.digitalStock.deleteMany({
    where: { productId: { in: [subProduct.id, licProduct.id, wsProduct.id, dlProduct.id] } },
  });
  await prisma.variation.deleteMany({
    where: { productId: { in: [subProduct.id, licProduct.id, wsProduct.id, dlProduct.id] } },
  });
  await prisma.product.deleteMany({
    where: { id: { in: [subProduct.id, licProduct.id, wsProduct.id, dlProduct.id] } },
  });
  console.log("  Cleaned up all temporary test records.\n");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("=================================================");
  console.log(`  TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log("=================================================");

  if (failedCount > 0) {
    throw new Error(`Master test suite failed with ${failedCount} errors.`);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Master Suite Execution Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
