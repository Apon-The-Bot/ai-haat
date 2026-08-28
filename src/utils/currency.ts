import { Currency } from "@/types";

export const BDT_PER_USD: number | null = process.env.NEXT_PUBLIC_BDT_PER_USD
  ? Number(process.env.NEXT_PUBLIC_BDT_PER_USD)
  : null;

export function convertBDTtoUSD(bdt: number): number | null {
  if (!BDT_PER_USD || BDT_PER_USD <= 0) return null;
  return Number((bdt / BDT_PER_USD).toFixed(2));
}

export function formatPrice(amountBDT: number | undefined | null, currency: Currency = "BDT"): string {
  const val = Number(amountBDT) || 0;
  if (currency === "USD") {
    const usd = convertBDTtoUSD(val);
    if (usd !== null) {
      return `$${usd.toFixed(2)}`;
    }
  }
  return `৳${val.toLocaleString("en-US")}`;
}

export function formatPriceRange(minBDT: number, maxBDT: number, currency: Currency = "BDT"): string {
  if (minBDT === maxBDT) {
    return formatPrice(minBDT, currency);
  }
  return `${formatPrice(minBDT, currency)} - ${formatPrice(maxBDT, currency)}`;
}
