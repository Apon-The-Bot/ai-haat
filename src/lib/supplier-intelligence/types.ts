export type AvailabilityState = "IN_STOCK" | "OUT_OF_STOCK" | "LIMITED" | "UNKNOWN" | "STALE" | "UNLIMITED";

export type OfferAttributes = {
  brand?: string | null;
  family?: string | null;
  plan?: string | null;
  quantity?: number | null;
  validityDays?: number | null;
  region?: string | null;
  deliveryType?: string | null;
  accountType?: string | null;
  warranty?: string | null;
};

export type SupplierOffer = {
  supplierId: string;
  supplierName: string;
  externalProductId: string;
  externalVariantId?: string | null;
  name: string;
  currency: string;
  price: number | null;
  costBDT: number | null;
  availability: AvailabilityState;
  stockQuantity?: number | null;
  fetchedAt?: Date | null;
  attributes: OfferAttributes;
  verifiedMapping?: boolean;
  supplierEnabled?: boolean;
  fulfillmentSupported?: boolean;
  reliabilityScore?: number | null;
};

export type MatchDecision = {
  status: "VERIFIED_MATCH" | "HIGH_CONFIDENCE" | "NEEDS_REVIEW" | "NO_MATCH";
  score: number;
  reasons: string[];
  hardConflict: boolean;
};

export type SupplierSelection = {
  selected: SupplierOffer | null;
  eligible: SupplierOffer[];
  excluded: Array<{ offer: SupplierOffer; reasons: string[] }>;
  reason: string;
};
