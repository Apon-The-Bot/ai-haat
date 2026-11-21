import { jaccardSimilarity, normalizeOfferText } from "./normalization";
import type { MatchDecision, OfferAttributes, SupplierOffer } from "./types";

function comparable(value: string | number | null | undefined) { return value === null || value === undefined ? null : normalizeOfferText(String(value)); }

export function compareOfferAttributes(left: OfferAttributes, right: OfferAttributes): MatchDecision {
  const reasons: string[] = [];
  let score = 0;
  let hardConflict = false;
  const checks: Array<[keyof OfferAttributes, string, boolean]> = [
    ["brand", "brand", true], ["family", "product family", true], ["plan", "plan", true], ["region", "region", true],
    ["deliveryType", "delivery type", true], ["accountType", "account type", true], ["warranty", "warranty", false],
  ];
  for (const [key, label, critical] of checks) {
    const a = comparable(left[key] as string | null | undefined); const b = comparable(right[key] as string | null | undefined);
    if (!a || !b) continue;
    if (a === b) { score += critical ? 18 : 8; reasons.push(`${label} matches`); }
    else if (critical) { hardConflict = true; reasons.push(`${label} conflicts`); }
  }
  if (left.quantity != null && right.quantity != null) {
    if (left.quantity === right.quantity) { score += 20; reasons.push("quantity matches"); } else { hardConflict = true; reasons.push("quantity conflicts"); }
  }
  if (left.validityDays != null && right.validityDays != null) {
    if (left.validityDays === right.validityDays) { score += 20; reasons.push("validity matches"); } else { hardConflict = true; reasons.push("validity conflicts"); }
  }
  return { status: hardConflict ? "NO_MATCH" : score >= 80 ? "VERIFIED_MATCH" : score >= 55 ? "HIGH_CONFIDENCE" : score > 0 ? "NEEDS_REVIEW" : "NO_MATCH", score, reasons, hardConflict };
}

export function matchSupplierOffer(candidate: SupplierOffer, canonical: { name: string; attributes: OfferAttributes }): MatchDecision {
  const nameSimilarity = jaccardSimilarity(candidate.name, canonical.name);
  const attributes = compareOfferAttributes(candidate.attributes, canonical.attributes);
  const score = Math.min(100, Math.round(attributes.score * 0.8 + nameSimilarity * 20));
  const hardConflict = attributes.hardConflict;
  const status = hardConflict ? "NO_MATCH" : score >= 80 ? "VERIFIED_MATCH" : score >= 55 ? "HIGH_CONFIDENCE" : score > 0 ? "NEEDS_REVIEW" : "NO_MATCH";
  return { status, score, hardConflict, reasons: [`name similarity ${Math.round(nameSimilarity * 100)}%`, ...attributes.reasons] };
}
