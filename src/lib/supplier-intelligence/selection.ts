import type { SupplierOffer, SupplierSelection } from "./types";

export function selectLowestEligibleOffer(offers: SupplierOffer[], options?: { requireVerifiedMapping?: boolean; requireFreshStock?: boolean; minimumReliability?: number }): SupplierSelection {
  const eligible: SupplierOffer[] = [];
  const excluded: SupplierSelection["excluded"] = [];
  for (const offer of offers) {
    const reasons: string[] = [];
    if (offer.supplierEnabled === false) reasons.push("supplier disabled");
    if (offer.costBDT == null || !Number.isFinite(offer.costBDT) || offer.costBDT < 0) reasons.push("unknown or invalid cost");
    if (options?.requireVerifiedMapping !== false && offer.verifiedMapping !== true) reasons.push("mapping not verified");
    if (offer.fulfillmentSupported === false) reasons.push("fulfillment unsupported");
    if (offer.availability === "OUT_OF_STOCK") reasons.push("out of stock");
    if (options?.requireFreshStock && (offer.availability === "UNKNOWN" || offer.availability === "STALE")) reasons.push("availability is not fresh");
    if (options?.minimumReliability != null && (offer.reliabilityScore == null || offer.reliabilityScore < options.minimumReliability)) reasons.push("reliability threshold not met");
    if (reasons.length) excluded.push({ offer, reasons }); else eligible.push(offer);
  }
  eligible.sort((a, b) => (a.costBDT! - b.costBDT!) || ((b.reliabilityScore || 0) - (a.reliabilityScore || 0)) || a.supplierId.localeCompare(b.supplierId));
  const selected = eligible[0] || null;
  return { selected, eligible, excluded, reason: selected ? `Selected lowest eligible effective cost: ${selected.supplierName} at ৳${selected.costBDT!.toFixed(2)}.` : "No eligible supplier offer is available." };
}
