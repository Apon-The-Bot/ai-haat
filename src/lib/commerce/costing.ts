/**
 * AI Haat — Financial Costing & Profitability Engine
 * 
 * Implements strict accounting principles for digital products commerce:
 * 1. Revenue and Profit are NOT the same (Gross Profit = Net Revenue - Total COGS).
 * 2. Missing cost is strictly NULL (Unknown Cost) vs Explicit 0 (Free/Internal resource).
 * 3. Specific identification of DigitalStock cost basis.
 * 4. Replacements add additional COGS without erasing original stock cost.
 * 5. Refunds reduce Net Revenue without assuming unrecoverable stock is returned.
 * 6. Historical FX snapshots preserve transaction-time acquisition costs.
 */

export interface CostCalculationResult {
  unitsSold: number;
  grossRevenueBDT: number;
  refundedBDT: number;
  netRevenueBDT: number;
  originalCogsBDT: number;
  replacementCogsBDT: number;
  manualFulfillmentCogsBDT: number;
  totalCogsBDT: number;
  realizedGrossProfitBDT: number;
  realizedGrossMarginPct: number;
  costCoveragePct: number;
  isCostComplete: boolean;
  unknownCostUnits: number;
  knownCostUnits: number;
}

/**
 * Sanitize strings to prevent CSV Formula Injection in spreadsheet software
 */
export function sanitizeCsvFormula(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Convert foreign currency amount to BDT using acquisition-time FX snapshot
 */
export function convertCurrencyToBDT(
  amount: number | null | undefined,
  currency: string = "BDT",
  exchangeRateToBDT?: number | null
): number | null {
  if (amount === null || amount === undefined) return null;
  if (currency.toUpperCase() === "BDT") return Math.round(amount * 100) / 100;
  const rate = exchangeRateToBDT && exchangeRateToBDT > 0 ? exchangeRateToBDT : 1.0;
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Calculate Gross Margin Percentage safely avoiding division by zero
 */
export function calculateGrossMarginPct(grossProfitBDT: number, netRevenueBDT: number): number {
  if (netRevenueBDT <= 0) {
    return grossProfitBDT < 0 ? -100.0 : 0.0;
  }
  const margin = (grossProfitBDT / netRevenueBDT) * 100;
  return Math.round(margin * 10) / 10;
}

/**
 * Calculate Projected Gross Margin for future sales on Admin Product views
 */
export function calculateProjectedMargin(
  sellingPriceBDT: number,
  preferredCostBDT?: number | null
): {
  projectedProfitBDT: number | null;
  projectedMarginPct: number | null;
  hasPriceWarning: boolean;
  warningMessage?: string;
} {
  if (preferredCostBDT === null || preferredCostBDT === undefined) {
    return {
      projectedProfitBDT: null,
      projectedMarginPct: null,
      hasPriceWarning: false,
    };
  }

  const projectedProfit = Math.round((sellingPriceBDT - preferredCostBDT) * 100) / 100;
  const projectedMargin = sellingPriceBDT > 0
    ? Math.round(((sellingPriceBDT - preferredCostBDT) / sellingPriceBDT) * 1000) / 10
    : 0;

  const hasPriceWarning = projectedProfit < 0;
  const warningMessage = hasPriceWarning
    ? `Warning: Selling price (৳${sellingPriceBDT}) is below preferred supplier cost (৳${preferredCostBDT})!`
    : undefined;

  return {
    projectedProfitBDT: projectedProfit,
    projectedMarginPct: projectedMargin,
    hasPriceWarning,
    warningMessage,
  };
}

/**
 * Compute realized financial metrics for an OrderItem or group of OrderItems
 */
export function computeOrderItemFinancials(params: {
  priceBDT: number;
  quantity: number;
  refundedBDT?: number;
  digitalStocks?: Array<{
    id: string;
    costPriceBDT?: number | null;
    status: string;
  }>;
  deliveredKeys?: Array<{
    id: string;
    stockId?: string | null;
    isReplacement: boolean;
  }>;
  fulfillmentCosts?: Array<{
    costBDT: number;
  }>;
}): CostCalculationResult {
  const unitsSold = Math.max(1, params.quantity || 1);
  const grossRevenueBDT = Math.round(params.priceBDT * unitsSold * 100) / 100;
  const refundedBDT = Math.round((params.refundedBDT || 0) * 100) / 100;
  const netRevenueBDT = Math.max(0, Math.round((grossRevenueBDT - refundedBDT) * 100) / 100);

  let originalCogsBDT = 0;
  let replacementCogsBDT = 0;
  let manualFulfillmentCogsBDT = 0;
  let knownCostUnits = 0;
  let unknownCostUnits = 0;

  // 1. Evaluate DigitalStock items if assigned
  const stocks = params.digitalStocks || [];
  if (stocks.length > 0) {
    for (const stock of stocks) {
      if (stock.costPriceBDT === null || stock.costPriceBDT === undefined) {
        unknownCostUnits++;
      } else {
        knownCostUnits++;
        const cost = Number(stock.costPriceBDT);
        if (stock.status === "REPLACED") {
          // Original stock that got replaced
          originalCogsBDT += cost;
        } else {
          // Delivered or Active stock
          originalCogsBDT += cost;
        }
      }
    }
  }

  // 2. Evaluate Replacement deliveries if any deliveredKeys are marked as replacement
  const delKeys = params.deliveredKeys || [];
  const replacementKeys = delKeys.filter((k) => k.isReplacement);
  if (replacementKeys.length > 0) {
    for (const rk of replacementKeys) {
      if (rk.stockId) {
        const matchingStock = stocks.find((s) => s.id === rk.stockId);
        if (matchingStock && matchingStock.costPriceBDT !== null && matchingStock.costPriceBDT !== undefined) {
          replacementCogsBDT += Number(matchingStock.costPriceBDT);
          // Deduct from original to avoid double counting if it was added above
          originalCogsBDT = Math.max(0, originalCogsBDT - Number(matchingStock.costPriceBDT));
        }
      }
    }
  }

  // 3. Evaluate Manual Fulfillment Costs
  const costs = params.fulfillmentCosts || [];
  for (const c of costs) {
    manualFulfillmentCogsBDT += Number(c.costBDT || 0);
    knownCostUnits++;
  }

  // If no digital stocks and no manual costs recorded, check if units are unknown
  if (stocks.length === 0 && costs.length === 0) {
    unknownCostUnits = unitsSold;
  }

  const totalCogsBDT = Math.round((originalCogsBDT + replacementCogsBDT + manualFulfillmentCogsBDT) * 100) / 100;
  const realizedGrossProfitBDT = Math.round((netRevenueBDT - totalCogsBDT) * 100) / 100;
  const realizedGrossMarginPct = calculateGrossMarginPct(realizedGrossProfitBDT, netRevenueBDT);

  const totalEvaluatedUnits = knownCostUnits + unknownCostUnits;
  const costCoveragePct = totalEvaluatedUnits > 0
    ? Math.round((knownCostUnits / totalEvaluatedUnits) * 1000) / 10
    : (unknownCostUnits > 0 ? 0.0 : 100.0);

  const isCostComplete = unknownCostUnits === 0 && knownCostUnits >= unitsSold;

  return {
    unitsSold,
    grossRevenueBDT,
    refundedBDT,
    netRevenueBDT,
    originalCogsBDT: Math.round(originalCogsBDT * 100) / 100,
    replacementCogsBDT: Math.round(replacementCogsBDT * 100) / 100,
    manualFulfillmentCogsBDT: Math.round(manualFulfillmentCogsBDT * 100) / 100,
    totalCogsBDT,
    realizedGrossProfitBDT,
    realizedGrossMarginPct,
    costCoveragePct,
    isCostComplete,
    unknownCostUnits,
    knownCostUnits,
  };
}
