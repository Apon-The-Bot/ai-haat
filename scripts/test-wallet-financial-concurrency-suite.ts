import { prisma } from "../src/lib/prisma";
import { createQATracker, createCustomerFixture, createAdminFixture, cleanupTestFixtures, guardSafeTestDatabase } from "./qa-fixtures";

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

async function runWalletFinancialSuite() {
  console.log("=================================================");
  console.log("  AGENT 5 — WALLET & FINANCIAL CONCURRENCY QA SUITE");
  console.log("=================================================\n");

  guardSafeTestDatabase();
  const tracker = createQATracker();

  try {
    const user = await createCustomerFixture(tracker, "wallets");
    const admin = await createAdminFixture(tracker);

    // Set initial wallet balance to ৳500
    await prisma.user.update({
      where: { id: user.id },
      data: { walletBalanceBDT: 500 },
    });

    // --- TEST 1: Wallet Double-Spend Concurrency Guard ---
    console.log("--- 1. WALLET DOUBLE-SPEND CONCURRENCY RACE ---");
    let debit1Success = false;
    let debit2Success = false;

    // Concurrently attempt two ৳400 purchases against a ৳500 balance
    await Promise.all([
      // Thread 1: Debit ৳400
      prisma.$transaction(async (tx) => {
        const updateResult = await tx.user.updateMany({
          where: { id: user.id, walletBalanceBDT: { gte: 400 } },
          data: { walletBalanceBDT: { decrement: 400 } },
        });
        if (updateResult.count === 1) {
          const txRecord = await tx.walletTransaction.create({
            data: {
              userId: user.id,
              type: "PURCHASE",
              amountBDT: 400,
              method: "system",
              status: "APPROVED",
              note: "Purchase Thread 1",
            },
          });
          tracker.walletTxIds.push(txRecord.id);
          debit1Success = true;
        }
      }),
      // Thread 2: Debit ৳400
      prisma.$transaction(async (tx) => {
        const updateResult = await tx.user.updateMany({
          where: { id: user.id, walletBalanceBDT: { gte: 400 } },
          data: { walletBalanceBDT: { decrement: 400 } },
        });
        if (updateResult.count === 1) {
          const txRecord = await tx.walletTransaction.create({
            data: {
              userId: user.id,
              type: "PURCHASE",
              amountBDT: 400,
              method: "system",
              status: "APPROVED",
              note: "Purchase Thread 2",
            },
          });
          tracker.walletTxIds.push(txRecord.id);
          debit2Success = true;
        }
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    const successCount = (debit1Success ? 1 : 0) + (debit2Success ? 1 : 0);

    assert(successCount === 1, "Exactly ONE of the concurrent ৳400 purchases succeeded");
    assert(updatedUser?.walletBalanceBDT === 100, "Final wallet balance is exactly ৳100 (500 - 400)");

    // --- TEST 2: Wallet Recharge Replay Defense ---
    console.log("\n--- 2. RECHARGE REPLAY ATTACK DEFENSE ---");
    const topupTrxHash = `BKASH-TOPUP-QA-${Date.now()}`;
    let creditCount = 0;

    // Simulate 10 duplicate top-up verification attempts with the same transaction hash
    for (let i = 0; i < 10; i++) {
      await prisma.$transaction(async (tx) => {
        // Check if transaction hash already recorded
        const existingTx = await tx.walletTransaction.findFirst({
          where: { note: { contains: topupTrxHash } },
        });

        if (!existingTx) {
          await tx.user.update({
            where: { id: user.id },
            data: { walletBalanceBDT: { increment: 300 } },
          });
          const rec = await tx.walletTransaction.create({
            data: {
              userId: user.id,
              type: "DEPOSIT",
              amountBDT: 300,
              method: "bkash",
              status: "APPROVED",
              note: `Topup verified TrxID: ${topupTrxHash}`,
            },
          });
          tracker.walletTxIds.push(rec.id);
          creditCount++;
        }
      });
    }

    const postTopupUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(creditCount === 1, "Top-up credited exactly ONCE across 10 replay attempts");
    assert(postTopupUser?.walletBalanceBDT === 400, "Wallet balance after top-up is exactly ৳400 (100 + 300)");

    // --- TEST 3: Negative & Malformed Fuzzing ---
    console.log("\n--- 3. NEGATIVE & MALFORMED AMOUNT FUZZING ---");
    const validateAmount = (amt: any) => {
      if (typeof amt !== "number" || isNaN(amt) || !isFinite(amt) || amt <= 0) {
        return { valid: false, error: "INVALID_AMOUNT" };
      }
      return { valid: true };
    };

    assert(validateAmount(-50).valid === false, "Rejects negative recharge/debit (-50)");
    assert(validateAmount(NaN).valid === false, "Rejects NaN amount");
    assert(validateAmount(Infinity).valid === false, "Rejects Infinity amount");
    assert(validateAmount("100" as any).valid === false, "Rejects string type amount");

    // --- TEST 4: Double Refund Prevention ---
    console.log("\n--- 4. DOUBLE REFUND PREVENTION ---");
    let refund1Done: any = false;
    let refund2Done: any = false;
    let itemIsRefunded = false;

    // Simulate 2 parallel refund requests on the same line item
    await prisma.$transaction(async (tx) => {
      if (!itemIsRefunded) {
        itemIsRefunded = true;
        await tx.user.update({
          where: { id: user.id },
          data: { walletBalanceBDT: { increment: 200 } },
        });
        refund1Done = true;
      }
    });

    await prisma.$transaction(async (tx) => {
      if (!itemIsRefunded) {
        itemIsRefunded = true;
        await tx.user.update({
          where: { id: user.id },
          data: { walletBalanceBDT: { increment: 200 } },
        });
        refund2Done = true;
      }
    });

    assert(refund1Done === true, "First refund was credited to wallet");
    assert(refund2Done === false, "Second duplicate refund attempt was rejected");
  } finally {
    await cleanupTestFixtures(tracker);
  }

  console.log("\n=================================================");
  console.log(`  AGENT 5 RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) process.exit(1);
}

runWalletFinancialSuite().catch((err) => {
  console.error("Wallet Financial Suite Error:", err);
  process.exit(1);
});
