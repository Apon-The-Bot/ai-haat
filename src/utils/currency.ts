import { Currency } from "@/types";

export const BDT_PER_USD = 125;

export function convertBDTtoUSD(bdt: number): number {
  return Number((bdt / BDT_PER_USD).toFixed(2));
}

export function formatPrice(amountBDT: number | undefined | null, currency: Currency = "BDT"): string {
  const val = Number(amountBDT) || 0;
  if (currency === "USD") {
    const usd = convertBDTtoUSD(val);
    return `$${usd.toFixed(2)}`;
  }
  return `৳${val.toLocaleString("en-US")}`;
}

export function formatPriceRange(minBDT: number, maxBDT: number, currency: Currency = "BDT"): string {
  if (minBDT === maxBDT) {
    return formatPrice(minBDT, currency);
  }
  return `${formatPrice(minBDT, currency)} - ${formatPrice(maxBDT, currency)}`;
}
