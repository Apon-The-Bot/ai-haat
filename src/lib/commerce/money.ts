/**
 * AI Haat — Centralized Financial Money & Precision Utility
 * Guarantees deterministic arithmetic, poisha conversions, and rounding rules.
 */

/**
 * Convert BDT amount to integer minor units (poisha).
 * ৳499.50 -> 49950 poisha
 */
export function toPoisha(bdt: number): number {
  if (isNaN(bdt) || !isFinite(bdt)) return 0;
  return Math.round(bdt * 100);
}

/**
 * Convert integer minor units (poisha) back to BDT amount.
 * 49950 poisha -> ৳499.50
 */
export function fromPoisha(poisha: number): number {
  if (isNaN(poisha) || !isFinite(poisha)) return 0;
  return poisha / 100;
}

/**
 * Deterministically round BDT amount to 2 decimal places.
 */
export function roundBDT(amount: number, decimals = 2): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/**
 * Safe currency addition using integer minor units (poisha) to eliminate IEEE 754 float drift.
 */
export function safeAddBDT(a: number, b: number): number {
  return fromPoisha(toPoisha(a) + toPoisha(b));
}

/**
 * Safe currency subtraction using integer minor units.
 */
export function safeSubBDT(a: number, b: number): number {
  return fromPoisha(Math.max(0, toPoisha(a) - toPoisha(b)));
}

/**
 * Safe currency multiplication.
 */
export function safeMulBDT(amount: number, quantity: number): number {
  const cleanQty = Math.max(0, Math.floor(quantity));
  return fromPoisha(toPoisha(amount) * cleanQty);
}

/**
 * Calculate deterministic percentage discount with optional maximum cap.
 */
export function calculatePercentageDiscount(
  subtotalBDT: number,
  percent: number,
  maxDiscountBDT?: number | null
): number {
  if (subtotalBDT <= 0 || percent <= 0) return 0;
  const validPercent = Math.min(100, Math.max(0, percent));
  const rawDiscount = (subtotalBDT * validPercent) / 100;
  let finalDiscount = roundBDT(rawDiscount);

  if (maxDiscountBDT !== undefined && maxDiscountBDT !== null && maxDiscountBDT > 0) {
    finalDiscount = Math.min(finalDiscount, maxDiscountBDT);
  }

  return Math.min(subtotalBDT, finalDiscount);
}

/**
 * Format BDT amount with Bangladeshi Taka currency symbol (৳) and standard commas.
 */
export function formatBDT(amount: number, showDecimals = false): string {
  const rounded = roundBDT(amount);
  if (showDecimals && rounded % 1 !== 0) {
    return `৳${rounded.toFixed(2)}`;
  }
  return `৳${Math.round(rounded).toLocaleString("en-BD")}`;
}

/**
 * Standardize numeric or string input to canonical 2-decimal BDT number
 */
export function normalizeBDT(val: number | string | { toNumber?: () => number } | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return roundBDT(val.toNumber());
  }
  const parsed = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(parsed) ? 0 : roundBDT(parsed);
}

/**
 * Convert Prisma Decimal or number to pure JavaScript number
 */
export function decimalToBDT(val: any): number {
  return normalizeBDT(val);
}

/**
 * Parse string user input safely into BDT amount
 */
export function parseBDT(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : roundBDT(num);
}

/**
 * Serialize BDT number to fixed 2-decimal string
 */
export function serializeBDT(amount: number): string {
  return roundBDT(amount).toFixed(2);
}
