import assert from "assert";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";
import { 
  toPoisha, 
  fromPoisha, 
  safeAddBDT, 
  safeSubBDT 
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
// 1. Static Contract & Mock-Data Absence Audits
// -------------------------------------------------------------------------
registerTest("Mock Data Audit", "Admin Refunds page does not contain hardcoded mock requests or KPIs", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/admin/refunds/page.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("REF-1001"), false, "Must not contain REF-1001");
  assert.strictEqual(fileContent.includes("mock data for UI"), false);
  assert.strictEqual(fileContent.includes("fetch('/api/admin/refunds"), false);
  assert.strictEqual(fileContent.includes("fetch(`/api/admin/refunds"), true);
});

registerTest("Mock Data Audit", "Admin Replacements page does not contain hardcoded mock claims or KPIs", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/admin/replacements/page.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("REP-2001"), false, "Must not contain REP-2001");
  assert.strictEqual(fileContent.includes("fetch(\"/api/admin/replacements\")"), true);
});

registerTest("Mock Data Audit", "Admin Support Queue page does not contain hardcoded MOCK_TICKETS", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/admin/support/page.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("MOCK_TICKETS"), false);
  assert.strictEqual(fileContent.includes("TKT-9921"), false);
  assert.strictEqual(fileContent.includes("fetch(`/api/admin/support/tickets"), true);
});

registerTest("Mock Data Audit", "Customer Support Dashboard does not contain hardcoded mockTickets", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/dashboard/support/page.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("mockTickets"), false);
  assert.strictEqual(fileContent.includes("TKT-20260828-1021"), false);
  assert.strictEqual(fileContent.includes("fetch(\"/api/support/tickets\")"), true);
});

registerTest("Mock Data Audit", "Customer Ticket Details page does not contain hardcoded mockTicket", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/dashboard/support/[id]/page.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("const mockTicket ="), false);
  assert.strictEqual(fileContent.includes("fetch(`/api/support/tickets/"), true);
});

// -------------------------------------------------------------------------
// 2. Operational Configuration & Contact Hardening
// -------------------------------------------------------------------------
registerTest("Config Hardening", "Floating WhatsApp widget gracefully returns null when NEXT_PUBLIC_WHATSAPP_NUMBER is unconfigured", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/components/cro/FloatingWhatsAppWidget.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("process.env.NEXT_PUBLIC_WHATSAPP_NUMBER"), true);
  assert.strictEqual(fileContent.includes("!WHATSAPP_NUMBER"), true);
  assert.strictEqual(fileContent.includes("return null"), true);
});

registerTest("Config Hardening", "Header admin button strictly uses role-based authentication without hardcoded emails", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/components/Header.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("mdamanullahsheikhapon@gmail.com"), false);
  assert.strictEqual(fileContent.includes("user.role === \"ADMIN\""), true);
});

registerTest("Config Hardening", "NotificationContext uses role-based authentication without hardcoded emails", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/context/NotificationContext.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("mdamanullahsheikhapon@gmail.com"), false);
  assert.strictEqual(fileContent.includes("user?.role === \"ADMIN\""), true);
});

registerTest("Config Hardening", "Telegram dispatcher prioritizes TELEGRAM_ADMIN_CHAT_ID", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/utils/telegram.ts"), "utf8");
  assert.strictEqual(fileContent.includes("process.env.TELEGRAM_ADMIN_CHAT_ID"), true);
});

registerTest("Config Hardening", "Welcome onboarding email is only dispatched on new user registration", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/lib/auth.ts"), "utf8");
  assert.strictEqual(fileContent.includes("let isNewUser = false;"), true);
  assert.strictEqual(fileContent.includes("if (isNewUser && user.name)"), true);
});

// -------------------------------------------------------------------------
// 3. Manual Wallet Recharge & Ledger Contracts
// -------------------------------------------------------------------------
registerTest("Wallet Recharge", "Manual recharge route enforces durable database creation with unique trxId check", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/api/wallet/recharge/route.ts"), "utf8");
  assert.strictEqual(fileContent.includes("prisma.walletTransaction.create"), true);
  assert.strictEqual(fileContent.includes("status: \"PENDING\""), true);
  assert.strictEqual(fileContent.includes("prisma.walletTransaction.findUnique"), true);
});

registerTest("Wallet Transactions", "Wallet transactions PATCH route enforces atomic status transition from PENDING", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/api/wallet/transactions/route.ts"), "utf8");
  assert.strictEqual(fileContent.includes("status: \"PENDING\""), true);
  assert.strictEqual(fileContent.includes("statusUpdate.count === 0"), true);
  assert.strictEqual(fileContent.includes("alreadyProcessed"), true);
});

// -------------------------------------------------------------------------
// 4. Support Ticket Ownership & IDOR Defense Contract
// -------------------------------------------------------------------------
registerTest("Support Security", "Customer support routes strictly scope ticket lookup to session user ID", () => {
  const listFile = fs.readFileSync(path.join(process.cwd(), "src/app/api/support/tickets/route.ts"), "utf8");
  assert.strictEqual(listFile.includes("where: { userId: user.id }"), true);

  const detailFile = fs.readFileSync(path.join(process.cwd(), "src/app/api/support/tickets/[id]/route.ts"), "utf8");
  assert.strictEqual(detailFile.includes("ticket.userId !== user.id"), true);
  assert.strictEqual(detailFile.includes("return NextResponse.json({ error: \"Unauthorized\" }, { status: 403 })"), true);
});

// -------------------------------------------------------------------------
// Execution Engine
// -------------------------------------------------------------------------
async function main() {
  console.log("================================================================================");
  console.log("AI HAAT - PHASE 6: OPERATIONAL WORKFLOWS & ADMIN/CUSTOMER SUITE");
  console.log("Deterministic Production Operational Verification Harness");
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
  console.log("PHASE 6 OPERATIONAL WORKFLOW SUITE SUMMARY");
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
