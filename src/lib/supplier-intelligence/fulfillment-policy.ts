import type { SupplierOffer } from "./types";

export type FulfillmentMode = "AUTOMATIC" | "MANUAL";
export type SupplierSelectionPolicy = "AUTO_ONLY" | "MANUAL_ONLY" | "PREFER_AUTO" | "LOWEST_ELIGIBLE_COST";
export type FulfillmentRuleSource = "ORDER_ITEM" | "VARIANT" | "PRODUCT" | "SUPPLIER" | "GLOBAL";

export type FulfillmentRule = {
  mode?: FulfillmentMode | null;
  supplierSelectionPolicy?: SupplierSelectionPolicy | null;
  allowFallback?: boolean;
  minimumProfitBDT?: number | null;
  maximumAutomaticPurchaseBDT?: number | null;
};

export type FulfillmentPolicyInput = {
  global: FulfillmentRule;
  supplier?: FulfillmentRule | null;
  product?: FulfillmentRule | null;
  variant?: FulfillmentRule | null;
  orderItem?: FulfillmentRule | null;
  emergencyAutomaticStop?: boolean;
  offers: SupplierOffer[];
  expectedCostBDT?: number | null;
  sellingPriceBDT?: number | null;
};

export type FulfillmentPolicyDecision = {
  requestedMode: FulfillmentMode;
  effectiveMode: FulfillmentMode;
  source: FulfillmentRuleSource;
  selectionPolicy: SupplierSelectionPolicy;
  selectedSupplier: SupplierOffer | null;
  eligibleSuppliers: SupplierOffer[];
  reasons: string[];
  requiresManualReview: boolean;
};

function firstMode(input: FulfillmentPolicyInput): { mode: FulfillmentMode; source: FulfillmentRuleSource } {
  const rules: Array<[FulfillmentRuleSource, FulfillmentRule | null | undefined]> = [
    ["ORDER_ITEM", input.orderItem], ["VARIANT", input.variant], ["PRODUCT", input.product],
    ["SUPPLIER", input.supplier], ["GLOBAL", input.global],
  ];
  const selected = rules.find(([, rule]) => rule?.mode);
  return { mode: selected?.[1]?.mode || "MANUAL", source: selected?.[0] || "GLOBAL" };
}

function effectiveRule(input: FulfillmentPolicyInput): FulfillmentRule {
  return input.orderItem || input.variant || input.product || input.supplier || input.global;
}

function isAutoEligible(offer: SupplierOffer): boolean {
  return offer.supplierEnabled !== false && offer.fulfillmentSupported === true && offer.verifiedMapping === true &&
    offer.costBDT != null && Number.isFinite(offer.costBDT) && offer.availability !== "OUT_OF_STOCK" && offer.availability !== "STALE";
}

function lowestCost(offers: SupplierOffer[]): SupplierOffer | null {
  return offers.slice().sort((a, b) => (a.costBDT! - b.costBDT!) || a.supplierId.localeCompare(b.supplierId))[0] || null;
}

export function resolveFulfillmentPolicy(input: FulfillmentPolicyInput): FulfillmentPolicyDecision {
  const requested = firstMode(input);
  const rule = effectiveRule(input);
  const policy = rule.supplierSelectionPolicy || "LOWEST_ELIGIBLE_COST";
  const reasons: string[] = [];
  const autoEligible = input.offers.filter(isAutoEligible);
  const manualEligible = input.offers.filter((offer) => offer.supplierEnabled !== false && offer.verifiedMapping === true && offer.costBDT != null && Number.isFinite(offer.costBDT));
  let effectiveMode = requested.mode;
  let requiresManualReview = false;

  if (input.emergencyAutomaticStop && effectiveMode === "AUTOMATIC") {
    effectiveMode = "MANUAL";
    requiresManualReview = true;
    reasons.push("Emergency automatic fulfillment stop is enabled.");
  }

  if (effectiveMode === "AUTOMATIC" && rule.maximumAutomaticPurchaseBDT != null && (input.expectedCostBDT == null || input.expectedCostBDT > rule.maximumAutomaticPurchaseBDT)) {
    effectiveMode = "MANUAL";
    requiresManualReview = true;
    reasons.push("Expected automatic purchase cost exceeds the configured limit.");
  }

  if (effectiveMode === "AUTOMATIC" && rule.minimumProfitBDT != null && input.sellingPriceBDT != null && input.expectedCostBDT != null && input.sellingPriceBDT - input.expectedCostBDT < rule.minimumProfitBDT) {
    effectiveMode = "MANUAL";
    requiresManualReview = true;
    reasons.push("Expected profit is below the configured minimum.");
  }

  const eligibleSuppliers = effectiveMode === "AUTOMATIC" ? autoEligible : manualEligible;
  if (effectiveMode === "AUTOMATIC" && !autoEligible.length) {
    effectiveMode = "MANUAL";
    requiresManualReview = true;
    reasons.push("No supplier has verified automatic ordering and delivery capability.");
  }

  const selectedPool = policy === "AUTO_ONLY" ? autoEligible : policy === "MANUAL_ONLY" ? manualEligible :
    effectiveMode === "AUTOMATIC" ? autoEligible : manualEligible;
  const selectedSupplier = lowestCost(selectedPool);
  if (!selectedSupplier) reasons.push("No eligible supplier offer is available.");
  else reasons.push(`Selected ${selectedSupplier.supplierName} using ${policy} policy.`);

  return { requestedMode: requested.mode, effectiveMode, source: requested.source, selectionPolicy: policy, selectedSupplier, eligibleSuppliers: effectiveMode === "AUTOMATIC" ? autoEligible : manualEligible, reasons, requiresManualReview };
}
