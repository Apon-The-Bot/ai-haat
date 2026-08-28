import { prisma } from "../src/lib/prisma";
import { finalizeWalletTopup } from "../src/lib/commerce/wallet-topup";
import { isCronAuthorized, safeEqualSecret } from "../src/lib/cron-auth";
import { validateSupplierAuth } from "../src/lib/commerce/suppliers";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";

async function runP0Tests() {
  console.log("=========================================================================");
  console.log("🧪 AI HAAT — PHASE 2 P0 CRITICAL SECURITY & IDEMPOTENCY VERIFICATION SUITE");
  console.log("=========================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  const testSuffix = Date.now().toString();
  const testEmail = `p0_test_user_${testSuffix}@aihaat.shop`;

  // Create isolated test user
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "P0 Concurrency Test User",
      role: "USER",
      walletBalanceBDT: 0,
    },
  });

  try {
    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 1: WALLET CONCURRENCY & IDEMPOTENCY (P0-1)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("--- 1. WALLET CONCURRENCY & IDEMPOTENCY (P0-1) ---");

    // Test 1: Webhook alone credits once
    const trx1 = `trx_single_webhook_${testSuffix}`;
    const res1 = await finalizeWalletTopup({
      userId: user.id,
      userEmail: user.email,
      amountBDT: 100,
      trxId: trx1,
      method: "bkash",
    });
    assert(res1.success && !res1.alreadyProcessed, "Single webhook creates successful credit");

    // Verify balance = 100
    let freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(freshUser?.walletBalanceBDT === 100, "User wallet balance incremented to exactly ৳100");

    // Test 2: Callback alone for same trxId returns alreadyProcessed
    const res2 = await finalizeWalletTopup({
      userId: user.id,
      userEmail: user.email,
      amountBDT: 100,
      trxId: trx1,
      method: "bkash",
    });
    assert(res2.success && res2.alreadyProcessed, "Callback with same trxId recognizes alreadyProcessed");

    freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(freshUser?.walletBalanceBDT === 100, "Wallet balance remains exactly ৳100 (no duplicate credit)");

    // Test 3: Concurrent Webhook + Callback race (Simulated via Promise.all)
    const trxRace = `trx_race_${testSuffix}`;
    const [raceWebhook, raceCallback] = await Promise.all([
      finalizeWalletTopup({
        userId: user.id,
        userEmail: user.email,
        amountBDT: 250,
        trxId: trxRace,
        method: "nagad",
      }),
      finalizeWalletTopup({
        userId: user.id,
        userEmail: user.email,
        amountBDT: 250,
        trxId: trxRace,
        method: "nagad",
      }),
    ]);

    const winnerCount = (raceWebhook.alreadyProcessed ? 0 : 1) + (raceCallback.alreadyProcessed ? 0 : 1);
    assert(winnerCount === 1, "Exactly ONE winner between concurrent webhook and callback");

    freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(freshUser?.walletBalanceBDT === 350, "Wallet balance incremented by exactly ৳250 (Total: ৳350)");

    // Test 4: 10 Identical Concurrent Requests
    const trxBurst = `trx_burst_${testSuffix}`;
    const burstPromises = Array.from({ length: 10 }, () =>
      finalizeWalletTopup({
        userId: user.id,
        userEmail: user.email,
        amountBDT: 50,
        trxId: trxBurst,
        method: "rocket",
      })
    );
    const burstResults = await Promise.all(burstPromises);
    const burstWinners = burstResults.filter((r) => !r.alreadyProcessed).length;
    const burstProcessed = burstResults.filter((r) => r.alreadyProcessed).length;

    assert(burstWinners === 1 && burstProcessed === 9, "10 concurrent requests produce exactly 1 credit and 9 idempotent responses");

    freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(freshUser?.walletBalanceBDT === 400, "Wallet balance incremented by exactly ৳50 (Total: ৳400)");

    // Test 5: Reused provider trxId with conflicting amount is flagged as conflict
    const resTamper = await finalizeWalletTopup({
      userId: user.id,
      userEmail: user.email,
      amountBDT: 9999,
      trxId: trxBurst,
      method: "rocket",
    });
    assert(!resTamper.success && resTamper.conflict === true, "Reused provider trxId with altered amount returns PAYMENT_IDEMPOTENCY_CONFLICT");

    freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert(freshUser?.walletBalanceBDT === 400, "Wallet balance preserved strictly at ৳400");

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 2: HARDCODED DATABASE PASSWORD (P0-2)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 2. DATABASE SECRET SANITIZATION (P0-2) ---");

    const prismaSource = fs.readFileSync(path.join(process.cwd(), "src/lib/prisma.ts"), "utf8");
    assert(!prismaSource.includes("Rhythm#"), "src/lib/prisma.ts contains zero plaintext passwords");
    assert(!prismaSource.includes("Aihaatdb01"), "src/lib/prisma.ts contains zero database credentials");

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 3: CRON EMAIL-QUEUE AUTHENTICATION (P0-3)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 3. CRON AUTHENTICATION & TIMING SAFETY (P0-3) ---");

    // Test timing safe secret comparison
    assert(safeEqualSecret("supersecret123", "supersecret123"), "safeEqualSecret matches identical secrets");
    assert(!safeEqualSecret("supersecret123", "wrongsecret123"), "safeEqualSecret rejects mismatched secrets");
    assert(!safeEqualSecret("short", "longersecret"), "safeEqualSecret safely rejects length differences without throwing");
    assert(!safeEqualSecret("", "secret"), "safeEqualSecret rejects empty strings");

    // Test cron authorization fail-closed
    const originalCronSecret = process.env.CRON_SECRET;

    // A. When CRON_SECRET is unset
    delete process.env.CRON_SECRET;
    const reqUnsetNoAuth = new NextRequest("http://localhost:3000/api/cron/email-queue");
    const isAuthUnset = isCronAuthorized(reqUnsetNoAuth);
    assert(!isAuthUnset, "Unset CRON_SECRET strictly rejects unauthenticated request (fail-closed)");

    const reqUnsetFakeAuth = new NextRequest("http://localhost:3000/api/cron/email-queue", {
      headers: { authorization: "Bearer some_random_token" },
    });
    const isAuthUnsetFake = isCronAuthorized(reqUnsetFakeAuth);
    assert(!isAuthUnsetFake, "Unset CRON_SECRET strictly rejects arbitrary token (fail-closed)");

    // B. When CRON_SECRET is set
    process.env.CRON_SECRET = "production_cron_secret_xyz789";

    const reqValidBearer = new NextRequest("http://localhost:3000/api/cron/email-queue", {
      headers: { authorization: "Bearer production_cron_secret_xyz789" },
    });
    assert(isCronAuthorized(reqValidBearer), "Configured CRON_SECRET accepts matching Bearer token");

    const reqQueryParamBlocked = new NextRequest("http://localhost:3000/api/cron/email-queue?token=production_cron_secret_xyz789");
    assert(!isCronAuthorized(reqQueryParamBlocked), "Configured CRON_SECRET strictly rejects ?token query param (Bearer-only)");

    const reqInvalidBearer = new NextRequest("http://localhost:3000/api/cron/email-queue", {
      headers: { authorization: "Bearer wrong_token_123" },
    });
    assert(!isCronAuthorized(reqInvalidBearer), "Configured CRON_SECRET rejects invalid Bearer token");

    // Restore env
    if (originalCronSecret) process.env.CRON_SECRET = originalCronSecret;
    else delete process.env.CRON_SECRET;

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 4: SUPPLIER WEBHOOK SECRET BYPASS (P0-4)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 4. SUPPLIER WEBHOOK AUTHENTICATION (P0-4) ---");

    // Create test supplier with apiSecret
    const supplierKey = `test_sup_key_${testSuffix}`;
    const supplierSecret = `test_sup_secret_${testSuffix}`;

    const supplier = await prisma.supplier.create({
      data: {
        name: "P0 Test Supplier",
        code: `SUP_P0_${testSuffix}`,
        contactEmail: `supplier_${testSuffix}@example.com`,
        apiKey: supplierKey,
        apiSecret: supplierSecret,
        isActive: true,
        status: "ACTIVE",
      },
    });

    try {
      // Test A: Missing secret header when supplier has apiSecret in DB
      const authNoSecret = await validateSupplierAuth(supplierKey);
      assert(!authNoSecret.isValid, "Omitted X-Supplier-Secret header is strictly rejected");

      // Test B: Wrong secret header
      const authWrongSecret = await validateSupplierAuth(supplierKey, "wrong_secret_value");
      assert(!authWrongSecret.isValid, "Mismatched X-Supplier-Secret header is strictly rejected");

      // Test C: Correct secret header
      const authValid = await validateSupplierAuth(supplierKey, supplierSecret);
      assert(authValid.isValid && authValid.supplier?.id === supplier.id, "Matching API Key + Secret successfully authenticated");

      // Test D: Blocked supplier
      await prisma.supplier.update({
        where: { id: supplier.id },
        data: { status: "BLOCKED" },
      });
      const authBlocked = await validateSupplierAuth(supplierKey, supplierSecret);
      assert(!authBlocked.isValid, "Blocked supplier is rejected despite valid secret");
    } finally {
      await prisma.supplier.delete({ where: { id: supplier.id } }).catch(() => {});
    }

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 5: GOOGLE OAUTH CREDENTIAL FILE & GITIGNORE (P0-5)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 5. OAUTH CREDENTIAL FILE & GITIGNORE (P0-5) ---");

    const secretFileExists = fs.existsSync(path.join(process.cwd(), "Ai Haat Client ID Secret.json"));
    assert(!secretFileExists, "Ai Haat Client ID Secret.json removed from project workspace");

    const gitignoreContent = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf8");
    assert(gitignoreContent.includes("*Client ID Secret*.json"), ".gitignore contains explicit *Client ID Secret*.json rule");
    assert(gitignoreContent.includes("client_secret*.json"), ".gitignore contains explicit client_secret*.json rule");

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 6: OPEN REDIRECT DEFENSE (P0-6)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 6. OPEN REDIRECT DEFENSE MATRIX (P0-6) ---");

    // Test Production Open Redirect Validator from src/lib/security/safe-redirect
    const { getValidatedDestination } = await import("../src/lib/security/safe-redirect");
    const defaultSite = "https://aihaat.shop";

    assert(getValidatedDestination("https://aihaat.shop/shop") === "https://aihaat.shop/shop", "Production validator allows valid same-origin URL");
    assert(getValidatedDestination("/product/chatgpt-plus") === "https://aihaat.shop/product/chatgpt-plus", "Production validator allows valid relative path");
    assert(getValidatedDestination("https://evil.com/phishing") === defaultSite, "Production validator blocks malicious external URL");
    assert(getValidatedDestination("https://aihaat.shop.evil.com") === defaultSite, "Production validator blocks subdomain trick");
    assert(getValidatedDestination("https://aihaat.shop@evil.com") === defaultSite, "Production validator blocks embedded credentials trick");
    assert(getValidatedDestination("//evil.com") === defaultSite, "Production validator blocks protocol-relative URL");
    assert(getValidatedDestination("/\\evil.com") === defaultSite, "Production validator blocks backslash protocol-relative URL");
    assert(getValidatedDestination("javascript:alert(1)") === defaultSite, "Production validator blocks javascript URI scheme");
    assert(getValidatedDestination("data:text/html,evil") === defaultSite, "Production validator blocks data URI scheme");
    assert(getValidatedDestination(null) === defaultSite, "Production validator safely falls back for null target URL");
  } finally {
    // Clean up test user & transactions
    await prisma.walletTransaction.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.notification.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }

  console.log("\n=========================================================================");
  console.log(`📊 PHASE 2 P0 TEST RESULTS: ${passed} PASSED | ${failed} FAILED (Total: ${passed + failed})`);
  console.log("=========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runP0Tests().finally(() => prisma.$disconnect());
