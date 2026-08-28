import { spawn } from "child_process";
import { join } from "path";

interface SuiteRun {
  name: string;
  agent: string;
  script: string;
}

const suites: SuiteRun[] = [
  { name: "Database & Concurrency Integrity", agent: "Agent 1 (Infrastructure)", script: "scripts/test-database-integrity-suite.ts" },
  { name: "Auth, MFA & 11-Resource IDOR Matrix", agent: "Agent 2 (Security)", script: "scripts/test-security-auth-idor-suite.ts" },
  { name: "Checkout, Pricing Tamper & Coupons", agent: "Agent 3 (Checkout)", script: "scripts/test-checkout-pricing-tamper-suite.ts" },
  { name: "Payment, Webhooks & Callback Race", agent: "Agent 4 (Payment)", script: "scripts/test-payment-webhook-concurrency-suite.ts" },
  { name: "Wallet & Financial Concurrency", agent: "Agent 5 (Wallet)", script: "scripts/test-wallet-financial-concurrency-suite.ts" },
  { name: "Digital Inventory & Domain Invariants", agent: "Agent 6 (Fulfillment)", script: "scripts/test-product-domain-master-suite.ts" },
  { name: "After-Sales, Refunds & Replacements", agent: "Agent 7 (After-Sales)", script: "scripts/test-aftersales-suite.ts" },
  { name: "Admin Operations & Manual Delivery", agent: "Agent 8 (Admin UX)", script: "scripts/test-admin-operations-suite.ts" },
  { name: "Support Tickets & Supplier Ingestion", agent: "Agent 9 (Operations)", script: "scripts/test-support-suite.ts" },
  { name: "Admin Commercial & BI Master Suite", agent: "Agent 8 (BI & Reports)", script: "scripts/test-admin-analytics-bi-master-suite.ts" },
  { name: "SEO, Analytics & Expiry Automation", agent: "Agent 10 (Release)", script: "scripts/test-seo-master-suite.ts" },
  { name: "Analytics Purchase Deduplication", agent: "Agent 10 (Release)", script: "scripts/test-analytics-suite.ts" },
  { name: "Customer Expiry Notifications", agent: "Agent 10 (Release)", script: "scripts/test-cron-expiry-notifications.ts" },
];

async function runCommand(script: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const isWindows = process.platform === "win32";
    const npxCmd = isWindows ? "npx.cmd" : "npx";
    const child = spawn(npxCmd, ["tsx", script], {
      cwd: join(__dirname, ".."),
      shell: true,
    });

    let output = "";
    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (data) => (output += data.toString()));

    child.on("close", (code) => {
      resolve({ success: code === 0, output });
    });
  });
}

async function main() {
  console.log("\n================================================================================");
  console.log("  AI HAAT — 10-AGENT MASTER QA ORCHESTRATOR & PRODUCTION VERIFICATION SUITE");
  console.log("================================================================================\n");

  const results: Array<{ name: string; agent: string; status: "PASS" | "FAIL"; durationMs: number }> = [];
  let allPass = true;

  for (const s of suites) {
    const start = Date.now();
    process.stdout.write(`⏳ Running [${s.agent}] ${s.name}... `);
    const res = await runCommand(s.script);
    const duration = Date.now() - start;

    if (res.success) {
      console.log(`✅ PASS (${duration}ms)`);
      results.push({ name: s.name, agent: s.agent, status: "PASS", durationMs: duration });
    } else {
      console.log(`❌ FAIL (${duration}ms)`);
      console.error(res.output);
      results.push({ name: s.name, agent: s.agent, status: "FAIL", durationMs: duration });
      allPass = false;
    }
  }

  console.log("\n================================================================================");
  console.log("  10-AGENT QA ORCHESTRATION SUMMARY TABLE");
  console.log("================================================================================");
  console.log(
    "| Agent | QA Suite | Status | Execution Time |"
  );
  console.log("| :--- | :--- | :---: | :---: |");
  for (const r of results) {
    console.log(`| ${r.agent} | ${r.name} | ${r.status === "PASS" ? "✅ PASS" : "❌ FAIL"} | ${r.durationMs}ms |`);
  }
  console.log("================================================================================\n");

  if (!allPass) {
    console.error("❌ Master QA Verification failed on one or more suites.");
    process.exit(1);
  }

  console.log("🎉 ALL 12 QA SUITES PASSED WITH 100% INVARIANT INTEGRITY!");
}

main().catch((err) => {
  console.error("Master Orchestrator Error:", err);
  process.exit(1);
});
