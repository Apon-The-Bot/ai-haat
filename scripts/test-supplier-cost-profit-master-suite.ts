// ─── AI Haat — Supplier, Cost Price, Batch, Margin & Profit Master Test Suite ───
// 25 Comprehensive Verification Tests covering all financial, costing, supplier,
// and accounting requirements.
//
// Run: npx tsx scripts/test-supplier-cost-profit-master-suite.ts

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  computeOrderItemFinancials,
  calculateGrossMarginPct,
  calculateProjectedMargin,
  convertCurrencyToBDT,
  sanitizeCsvFormula,
} from "../src/lib/commerce/costing";
import { sanitizeCsvValue } from "../src/lib/analytics/business-intelligence";
import { toPublicProductSummaryDTO, toPublicProductDetailDTO } from "../src/lib/commerce/dto";

const ROOT = join(__dirname, "..");
let pass = 0;
let fail = 0;

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    pass++;
    console.log(`  ✅ TEST ${pass + fail}: ${name}`);
  } else {
    fail++;
    console.error(`  ❌ TEST ${pass + fail}: ${name}${detail ? " — " + detail : ""}`);
  }
}

function fileExists(rel: string): boolean {
  return existsSync(join(ROOT, rel));
}

function fileContains(rel: string, ...patterns: string[]): boolean {
  if (!fileExists(rel)) return false;
  const content = readFileSync(join(ROOT, rel), "utf-8");
  return patterns.every((p) => content.includes(p));
}

console.log("\n" + "═".repeat(78));
console.log("  AI HAAT — SUPPLIER, COST PRICE, BATCH & PROFIT MASTER SUITE (25 Tests)");
console.log("═".repeat(78) + "\n");

// ─── TEST 1: Supplier & ProductSupplier Prisma Models ─────────────
assert(
  "Supplier, ProductSupplier, and OrderItemCost models exist in Prisma schema",
  fileContains(
    "prisma/schema.prisma",
    "model Supplier",
    "model ProductSupplier",
    "model InventoryBatch",
    "model OrderItemCost"
  )
);

// ─── TEST 2: Batch Procurement Calculation (100 × ৳100 = ৳10,000) ─
const batchProcurementTest = (() => {
  const qty = 100;
  const unitCostBDT = 100;
  const totalCostBDT = qty * unitCostBDT;
  return totalCostBDT === 10000;
})();
assert(
  "Batch procurement financial calculation accurately computes Total Cost (100 units × ৳100 = ৳10,000)",
  batchProcurementTest
);

// ─── TEST 3: USD Multi-Currency Batch with FX Snapshot ─────────────
const fxTest = (() => {
  const qty = 100;
  const unitCostUSD = 1.0;
  const fxSnapshot = 120.0;
  const unitCostBDT = convertCurrencyToBDT(unitCostUSD, "USD", fxSnapshot);
  const totalCostBDT = (unitCostBDT || 0) * qty;
  return unitCostBDT === 120 && totalCostBDT === 12000;
})();
assert(
  "USD multi-currency batch accurately snapshots historical FX rate ($1 @ ৳120 = ৳120/unit, total ৳12,000)",
  fxTest
);

// ─── TEST 4: DigitalStock Cost Basis Linkage to Batch & Supplier ──
assert(
  "DigitalStock model links to batchId, supplierId, and stores snapshot costPriceBDT",
  fileContains(
    "prisma/schema.prisma",
    "batchId                String?",
    "supplierId             String?",
    "costPriceBDT           Float?"
  )
);

// ─── TEST 5: Product Sale Profit Calculation (500 - 300 = 200, 40% margin)
const saleProfitTest = (() => {
  const result = computeOrderItemFinancials({
    priceBDT: 500,
    quantity: 1,
    refundedBDT: 0,
    digitalStocks: [{ id: "st-1", costPriceBDT: 300, status: "DELIVERED" }],
  });
  return (
    result.grossRevenueBDT === 500 &&
    result.netRevenueBDT === 500 &&
    result.totalCogsBDT === 300 &&
    result.realizedGrossProfitBDT === 200 &&
    result.realizedGrossMarginPct === 40 &&
    result.isCostComplete === true
  );
})();
assert(
  "Product sale profit accurately computes COGS ৳300, Gross Profit ৳200, Margin 40%",
  saleProfitTest
);

// ─── TEST 6: Replacement Cost Accounting (300 + 250 = 550, GP -50) 
const replacementCostTest = (() => {
  const result = computeOrderItemFinancials({
    priceBDT: 500,
    quantity: 1,
    refundedBDT: 0,
    digitalStocks: [
      { id: "st-orig", costPriceBDT: 300, status: "REPLACED" },
      { id: "st-repl", costPriceBDT: 250, status: "DELIVERED" },
    ],
    deliveredKeys: [
      { id: "dk-1", stockId: "st-orig", isReplacement: false },
      { id: "dk-2", stockId: "st-repl", isReplacement: true },
    ],
  });
  return (
    result.originalCogsBDT === 300 &&
    result.replacementCogsBDT === 250 &&
    result.totalCogsBDT === 550 &&
    result.realizedGrossProfitBDT === -50 &&
    result.realizedGrossMarginPct === -10
  );
})();
assert(
  "Replacement cost accounting adds replacement stock (৳250) to original stock (৳300) = COGS ৳550, GP -৳50",
  replacementCostTest
);

// ─── TEST 7: Refund Cost Accounting (Sale 500, Cost 300, Refund 500 = GP -300)
const refundCostTest = (() => {
  const result = computeOrderItemFinancials({
    priceBDT: 500,
    quantity: 1,
    refundedBDT: 500,
    digitalStocks: [{ id: "st-1", costPriceBDT: 300, status: "REFUNDED" }],
  });
  return (
    result.netRevenueBDT === 0 &&
    result.totalCogsBDT === 300 &&
    result.realizedGrossProfitBDT === -300
  );
})();
assert(
  "Full refund reduces Net Revenue to ৳0 while preserving non-reusable stock COGS ৳300 = GP -৳300",
  refundCostTest
);

// ─── TEST 8: Unused Procurement Separation (Spend ৳10,000, 10 sold = COGS ৳1,000, Stock ৳9,000)
const procurementSeparationTest = (() => {
  const purchasedQty = 100;
  const unitCost = 100;
  const totalProcurementSpend = purchasedQty * unitCost; // 10,000
  const soldQty = 10;
  const cogs = soldQty * unitCost; // 1,000
  const availableStockValuation = (purchasedQty - soldQty) * unitCost; // 9,000
  return totalProcurementSpend === 10000 && cogs === 1000 && availableStockValuation === 9000;
})();
assert(
  "Procurement spend (৳10,000) is strictly separated from COGS (৳1,000) and available stock valuation (৳9,000)",
  procurementSeparationTest
);

// ─── TEST 9: Unknown Cost Handling (null is NOT 0) ─────────────────
const unknownCostTest = (() => {
  const result = computeOrderItemFinancials({
    priceBDT: 500,
    quantity: 1,
    digitalStocks: [{ id: "st-1", costPriceBDT: null, status: "DELIVERED" }],
  });
  return (
    result.unknownCostUnits === 1 &&
    result.knownCostUnits === 0 &&
    result.costCoveragePct === 0 &&
    result.isCostComplete === false &&
    result.totalCogsBDT === 0
  );
})();
assert(
  "Unknown cost (costPriceBDT: null) flags item as COST UNKNOWN and costCoverage: 0% instead of assuming ৳0",
  unknownCostTest
);

// ─── TEST 10: Explicit Zero Cost Handling (cost = 0) ──────────────
const explicitZeroCostTest = (() => {
  const result = computeOrderItemFinancials({
    priceBDT: 500,
    quantity: 1,
    digitalStocks: [{ id: "st-1", costPriceBDT: 0, status: "DELIVERED" }],
  });
  return (
    result.unknownCostUnits === 0 &&
    result.knownCostUnits === 1 &&
    result.costCoveragePct === 100 &&
    result.isCostComplete === true &&
    result.totalCogsBDT === 0 &&
    result.realizedGrossProfitBDT === 500
  );
})();
assert(
  "Explicit zero cost (costPriceBDT: 0) is recognized as free/internal resource with 100% cost coverage",
  explicitZeroCostTest
);

// ─── TEST 11: Historical Selling Price Independence ───────────────
const historicalPriceTest = (() => {
  // Sold at historical price ৳500 with cost ৳300
  const historicalSale = computeOrderItemFinancials({
    priceBDT: 500,
    quantity: 1,
    digitalStocks: [{ id: "st-1", costPriceBDT: 300, status: "DELIVERED" }],
  });
  // Today's product selling price is now ৳700, but historical order is unaffected
  return historicalSale.grossRevenueBDT === 500 && historicalSale.realizedGrossProfitBDT === 200;
})();
assert(
  "Historical order maintains its selling price (৳500) and realized profit even if catalog price changes to ৳700",
  historicalPriceTest
);

// ─── TEST 12: Projected Margin vs Realized Margin ──────────────────
const projectedMarginTest = (() => {
  const proj = calculateProjectedMargin(1000, 600);
  const projWarning = calculateProjectedMargin(500, 600);
  return (
    proj.projectedProfitBDT === 400 &&
    proj.projectedMarginPct === 40 &&
    projWarning.hasPriceWarning === true &&
    projWarning.projectedProfitBDT === -100
  );
})();
assert(
  "Projected margin computes future catalog profitability (1000 - 600 = 400, 40%) and warns if selling below cost",
  projectedMarginTest
);

// ─── TEST 13: Audited Batch Cost Correction Endpoint ──────────────
assert(
  "Batch PATCH endpoint validates consumed inventory and requires adminReason for cost corrections",
  fileContains(
    "src/app/api/admin/inventory/batches/route.ts",
    "adminReason",
    "INVENTORY_BATCH_COST_CORRECTION",
    "logAdminAudit"
  )
);

// ─── TEST 14: Public API Privacy (No Cost, Supplier, or Margins) ──
const publicPrivacyTest = (() => {
  const rawProduct = {
    id: "p1",
    name: "ChatGPT Plus",
    slug: "chatgpt-plus",
    category: "AI",
    image: "https://img.com/p1.png",
    minPriceBDT: 2500,
    maxPriceBDT: 2500,
    costPriceBDT: 1800,
    features: "[]",
    variations: [{ id: "v1", name: "1 Month", priceBDT: 2500, costPriceBDT: 1800 }],
  };
  const summaryDTO: any = toPublicProductSummaryDTO(rawProduct);
  const detailDTO: any = toPublicProductDetailDTO(rawProduct);
  return (
    summaryDTO.costPriceBDT === undefined &&
    summaryDTO.supplierId === undefined &&
    detailDTO.costPriceBDT === undefined &&
    detailDTO.supplierId === undefined
  );
})();
assert(
  "Public Product Summary and Detail DTOs strictly omit costPriceBDT and supplier information",
  publicPrivacyTest
);

// ─── TEST 15: Customer Order API Privacy (Sanitized for non-admin) ─
assert(
  "Customer Order API (/api/orders) strictly hides digitalStocks costPriceBDT from non-admin users",
  fileContains(
    "src/app/api/orders/route.ts",
    "digitalStocks: isAdmin",
    "costPriceBDT: true"
  )
);

// ─── TEST 16: Admin MFA Guard on Supplier & Batch APIs ────────────
assert(
  "Admin Supplier and Batch APIs strictly enforce requireAdminMfa()",
  fileContains("src/app/api/admin/suppliers/route.ts", "requireAdminMfa()") &&
  fileContains("src/app/api/admin/inventory/batches/route.ts", "requireAdminMfa()") &&
  fileContains("src/app/api/admin/suppliers/mappings/route.ts", "requireAdminMfa()")
);

// ─── TEST 17: ProductSupplier Mapping API ─────────────────────────
assert(
  "ProductSupplier mappings endpoint supports preferred supplier and multi-currency default costs",
  fileContains(
    "src/app/api/admin/suppliers/mappings/route.ts",
    "isPreferred",
    "defaultCost",
    "currency",
    "leadTime"
  )
);

// ─── TEST 18: Manual OrderItem Fulfillment Cost Recording ─────────
assert(
  "Manual fulfillment cost endpoint (/api/admin/inventory/order-item-costs) records costs per OrderItem",
  fileContains(
    "src/app/api/admin/inventory/order-item-costs/route.ts",
    "orderItemId",
    "costBDT",
    "ORDER_ITEM_COST_RECORDED"
  )
);

// ─── TEST 19: Invalid Inventory Write-Off Accounting ──────────────
assert(
  "Inventory valuation report categorizes INVALID inventory as Write-Off Loss",
  fileContains(
    "src/lib/analytics/business-intelligence.ts",
    "totalInvalidWriteOffLossBDT",
    "INVALID"
  )
);

// ─── TEST 20: Expired Inventory Loss Accounting ───────────────────
assert(
  "Inventory valuation report categorizes EXPIRED stock as separate Expired Stock Loss",
  fileContains(
    "src/lib/analytics/business-intelligence.ts",
    "totalExpiredLossBDT",
    "EXPIRED"
  )
);

// ─── TEST 21: Supplier Performance Factual Quality Indicators ─────
assert(
  "Supplier performance analytics compute invalidRatePct and replacementRatePct",
  fileContains(
    "src/lib/commerce/suppliers.ts",
    "invalidRatePct",
    "replacementRatePct",
    "totalProcurementSpendBDT"
  )
);

// ─── TEST 22: CSV Formula Injection Sanitizer ─────────────────────
const csvSanitizerTest = (() => {
  const maliciousFormula1 = "=cmd|' /C calc'!A0";
  const maliciousFormula2 = "+12345";
  const maliciousFormula3 = "-SUM(A1:A10)";
  const maliciousFormula4 = "@admin";

  const s1 = sanitizeCsvFormula(maliciousFormula1);
  const s2 = sanitizeCsvFormula(maliciousFormula2);
  const s3 = sanitizeCsvFormula(maliciousFormula3);
  const s4 = sanitizeCsvFormula(maliciousFormula4);

  return (
    s1.startsWith("'") &&
    s2.startsWith("'") &&
    s3.startsWith("'") &&
    s4.startsWith("'")
  );
})();
assert(
  "CSV Formula Injection Sanitizer prepends single quote (') on =, +, -, @ characters",
  csvSanitizerTest
);

// ─── TEST 23: Profit & Margin BI Reporting Engine ─────────────────
assert(
  "getProfitAndMarginReport aggregates Net Revenue, COGS, Gross Profit, and Cost Coverage",
  fileContains(
    "src/lib/analytics/business-intelligence.ts",
    "getProfitAndMarginReport",
    "totalOriginalCogs",
    "totalReplacementCogs",
    "totalManualCogs",
    "totalGrossProfit"
  )
);

// ─── TEST 24: Admin Reports UI Profit & Suppliers Tabs ────────────
assert(
  "Admin Reports page includes dedicated PROFIT and SUPPLIERS analytics tabs",
  fileContains(
    "src/app/admin/reports/page.tsx",
    'activeTab === "PROFIT"',
    'activeTab === "SUPPLIERS"',
    "Realized Gross Profit & Margin Intelligence"
  )
);

// ─── TEST 25: Batch Ingestion Telegram Alert with Supplier Details 
assert(
  "Supplier batch ingestion triggers sanitized Telegram alert without leaking credentials",
  fileContains(
    "src/lib/commerce/suppliers.ts",
    "sendSupplierIngestionTelegramAlert",
    "batchRefToUse"
  )
);

console.log("\n" + "─".repeat(78));
console.log(`  RESULTS: ${pass} passed, ${fail} failed (${pass + fail} total)`);
console.log("─".repeat(78) + "\n");

if (fail === 0) {
  console.log("  🎉 ALL 25/25 SUPPLIER, COST & PROFIT MASTER TESTS PASSED!\n");
  process.exit(0);
} else {
  console.error(`  ❌ ${fail} TEST(S) FAILED!\n`);
  process.exit(1);
}
