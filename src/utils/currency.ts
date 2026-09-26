import { Currency } from "@/types";

export const DEFAULT_BDT_PER_USD = 130;

export const BDT_PER_USD: number =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_BDT_PER_USD
    ? Number(process.env.NEXT_PUBLIC_BDT_PER_USD) || DEFAULT_BDT_PER_USD
    : DEFAULT_BDT_PER_USD;

export function convertBDTtoUSD(bdt: number): number {
  const rate = BDT_PER_USD > 0 ? BDT_PER_USD : DEFAULT_BDT_PER_USD;
  return Number((bdt / rate).toFixed(2));
}

export function convertUSDtoBDT(usd: number): number {
  const rate = BDT_PER_USD > 0 ? BDT_PER_USD : DEFAULT_BDT_PER_USD;
  return Math.round(usd * rate);
}

export function formatPrice(amountBDT: number | string | undefined | null, currency: Currency = "BDT"): string {
  const val = Number(amountBDT) || 0;
  if (currency === "USD") {
    const usd = convertBDTtoUSD(val);
    return `$${usd.toFixed(2)}`;
  }
  return `৳${Math.round(val).toLocaleString("en-US")}`;
}

export function formatPriceRange(minBDT: number, maxBDT: number, currency: Currency = "BDT"): string {
  if (minBDT === maxBDT) {
    return formatPrice(minBDT, currency);
  }
  return `${formatPrice(minBDT, currency)} - ${formatPrice(maxBDT, currency)}`;
}
