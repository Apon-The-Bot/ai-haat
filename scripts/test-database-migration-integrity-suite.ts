import assert from "assert";
import { prisma } from "../src/lib/prisma";
import { 
  toPoisha, 
  fromPoisha, 
  roundBDT, 
  safeAddBDT, 
  safeSubBDT, 
  safeMulBDT, 
  calculatePercentageDiscount, 
  normalizeBDT, 
  decimalToBDT, 
  parseBDT, 
  serializeBDT 
} from "../src/lib/commerce/money";

interface TestCase {
  category: string;
  name: string;
  run: () => void | Promise<void>;
}

const testCases: TestCase[] = [];

function registerTest(category: string, name: string, run: () => void | Promise<void>) {
  testCases.push({ category, name, run });
}

// -------------------------------------------------------------------------
// 1. Money Arithmetic Precision & Edge Cases (Pure Unit / Non-Mutating)
// -------------------------------------------------------------------------
registerTest("Money Precision", "toPoisha and fromPoisha convert without IEEE-754 binary float drift", () => {
  assert.strictEqual(toPoisha(499.50), 49950);
  assert.strictEqual(toPoisha(0.10), 10);
  assert.strictEqual(toPoisha(0.30), 30);
  assert.strictEqual(fromPoisha(49950), 499.50);
  assert.strictEqual(fromPoisha(10), 0.10);
});

registerTest("Money Precision", "safeAddBDT eliminates 0.1 + 0.2 floating point drift (0.30000000000000004)", () => {
  const result = safeAddBDT(0.10, 0.20);
  assert.strictEqual(result, 0.30);
  assert.strictEqual(result.toString(), "0.3");
});

registerTest("Money Precision", "safeSubBDT prevents negative overflow and calculates exact differences", () => {
  assert.strictEqual(safeSubBDT(100.50, 45.25), 55.25);
  assert.strictEqual(safeSubBDT(10.00, 20.00), 0.00, "Must not allow negative balances");
});

registerTest("Money Precision", "safeMulBDT calculates multi-quantity line item totals deterministically", () => {
  assert.strictEqual(safeMulBDT(99.95, 3), 299.85);
  assert.strictEqual(safeMulBDT(199.90, 5), 999.50);
  assert.strictEqual(safeMulBDT(499.99, 10), 4999.90);
});

registerTest("Money Precision", "calculatePercentageDiscount calculates deterministic discount with ceiling", () => {
  // 10% on ৳500 = ৳50
  assert.strictEqual(calculatePercentageDiscount(500, 10), 50);
  // 15% on ৳350.50 = ৳52.58
  assert.strictEqual(calculatePercentageDiscount(350.50, 15), 52.58);
  // Cap at max discount ৳30
  assert.strictEqual(calculatePercentageDiscount(500, 10, 30), 30);
});

registerTest("Money Precision", "normalizeBDT and serializeBDT format numbers safely for API responses", () => {
  assert.strictEqual(normalizeBDT("499.99"), 499.99);
  assert.strictEqual(normalizeBDT({ toNumber: () => 1250.75 }), 1250.75);
  assert.strictEqual(serializeBDT(499.9), "499.90");
  assert.strictEqual(parseBDT("৳ 1,250.50 BDT"), 1250.50);
});

// -------------------------------------------------------------------------
// 2. Read-Only Production Database Schema & Financial Invariants
// -------------------------------------------------------------------------
registerTest("Database Invariants", "Database engine responds to ping queries", async () => {
  const count = await prisma.user.count();
  assert.strictEqual(typeof count, "number");
  assert.strictEqual(count >= 0, true);
});

registerTest("Database Invariants", "Zero users have negative walletBalanceBDT", async () => {
  const negativeUsers = await prisma.user.count({
    where: {
      walletBalanceBDT: { lt: 0 },
    },
  });
  assert.strictEqual(negativeUsers, 0, "No user wallet balance may be negative");
});

registerTest("Database Invariants", "Zero duplicate trxIds in completed wallet transactions", async () => {
  const txs = await prisma.walletTransaction.findMany({
    where: { trxId: { not: null } },
    select: { trxId: true },
  });

  const trxMap = new Set<string>();
  let duplicates = 0;
  for (const t of txs) {
    if (t.trxId) {
      if (trxMap.has(t.trxId)) {
        duplicates++;
      }
      trxMap.add(t.trxId);
    }
  }
  assert.strictEqual(duplicates, 0, "All wallet transaction trxIds must be distinct");
});

registerTest("Database Invariants", "Zero orphaned OrderItem records without valid Order reference", async () => {
  const items = await prisma.orderItem.findMany({ select: { orderId: true }, take: 100 });
  if (items.length === 0) return;
  const orderIds = Array.from(new Set(items.map(i => i.orderId)));
  const existingOrders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true },
  });
  const existingSet = new Set(existingOrders.map(o => o.id));
  const orphans = orderIds.filter(id => !existingSet.has(id));
  assert.strictEqual(orphans.length, 0, "All order items must belong to existing orders");
});

registerTest("Database Invariants", "Zero orphaned Refund records without valid Order reference", async () => {
  const refunds = await prisma.refund.findMany({ select: { orderId: true }, take: 100 });
  if (refunds.length === 0) return;
  const orderIds = Array.from(new Set(refunds.map(r => r.orderId)));
  const existingOrders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true },
  });
  const existingSet = new Set(existingOrders.map(o => o.id));
  const orphans = orderIds.filter(id => !existingSet.has(id));
  assert.strictEqual(orphans.length, 0, "All refunds must reference existing orders");
});

registerTest("Database Invariants", "Zero orphaned AffiliateCommission records without valid Profile reference", async () => {
  const commissions = await prisma.affiliateCommission.findMany({ select: { affiliateProfileId: true }, take: 100 });
  if (commissions.length === 0) return;
  const profileIds = Array.from(new Set(commissions.map(c => c.affiliateProfileId)));
  const existingProfiles = await prisma.affiliateProfile.findMany({
    where: { id: { in: profileIds } },
    select: { id: true },
  });
  const existingSet = new Set(existingProfiles.map(p => p.id));
  const orphans = profileIds.filter(id => !existingSet.has(id));
  assert.strictEqual(orphans.length, 0, "All commissions must reference existing affiliate profiles");
});

// -------------------------------------------------------------------------
// Execution Engine
// -------------------------------------------------------------------------
async function main() {
  console.log("================================================================================");
  console.log("AI HAAT - PHASE 5: DATABASE MIGRATION & FINANCIAL INTEGRITY SUITE");
  console.log("Read-Only Production-Safe Invariant & Precision Verification Harness");
  console.log("================================================================================\n");

  const declaredCount = testCases.length;
  let executedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  let currentCategory = "";

  for (const testCase of testCases) {
    if (testCase.category !== currentCategory) {
      currentCategory = testCase.category;
      console.log(`\n--- ${currentCategory} ---`);
    }

    executedCount++;
    try {
      await testCase.run();
      console.log(`  [PASS] ${testCase.name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  [FAIL] ${testCase.name}:`, err.message);
      failedCount++;
    }
  }

  console.log("\n================================================================================");
  console.log("PHASE 5 DATABASE & PRECISION SUITE SUMMARY");
  console.log(`Declared test cases : ${declaredCount}`);
  console.log(`Executed test cases : ${executedCount}`);
  console.log(`Passed              : ${passedCount}`);
  console.log(`Failed              : ${failedCount}`);
  console.log(`Skipped             : ${skippedCount}`);
  console.log("================================================================================");

  if (declaredCount !== executedCount || failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test harness uncaught error:", err);
  process.exit(1);
});
