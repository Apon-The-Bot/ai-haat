const aliases: Record<string, string> = {
  pro: "premium", premium: "premium", monthly: "30 days", month: "30 days", mo: "30 days", "30d": "30 days",
  yearly: "365 days", annual: "365 days", year: "365 days", yr: "365 days", "1y": "365 days",
};

export function normalizeOfferText(value: string | null | undefined): string {
  return (value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).map((token) => aliases[token] || token).join(" ");
}

export function tokenizeOfferName(value: string | null | undefined): string[] {
  return Array.from(new Set(normalizeOfferText(value).split(" ").filter(Boolean)));
}

export function jaccardSimilarity(left: string | null | undefined, right: string | null | undefined): number {
  const a = new Set(tokenizeOfferName(left));
  const b = new Set(tokenizeOfferName(right));
  if (!a.size || !b.size) return 0;
  const intersection = Array.from(a).filter((token) => b.has(token)).length;
  return intersection / new Set(Array.from(a).concat(Array.from(b))).size;
}

export function normalizeAvailability(value: unknown): import("./types").AvailabilityState {
  if (value === "Unlimited") return "UNLIMITED";
  if (typeof value === "number") return value > 0 ? (value < 5 ? "LIMITED" : "IN_STOCK") : "OUT_OF_STOCK";
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("out") || normalized === "false") return "OUT_OF_STOCK";
  if (normalized.includes("stale")) return "STALE";
  if (normalized.includes("unlimited")) return "UNLIMITED";
  if (normalized.includes("in stock") || normalized === "true") return "IN_STOCK";
  return "UNKNOWN";
}
