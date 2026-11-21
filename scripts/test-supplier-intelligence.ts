import assert from "node:assert/strict";
import { matchSupplierOffer } from "../src/lib/supplier-intelligence/matching";
import { normalizeAvailability, normalizeOfferText } from "../src/lib/supplier-intelligence/normalization";
import { selectLowestEligibleOffer } from "../src/lib/supplier-intelligence/selection";
import type { SupplierOffer } from "../src/lib/supplier-intelligence/types";

const canonical = { name: "OpenAI Premium Monthly", attributes: { brand: "OpenAI", plan: "premium", validityDays: 30 } };
const offer = (overrides: Partial<SupplierOffer> = {}): SupplierOffer => ({
  supplierId: "supplier-a", supplierName: "Supplier A", externalProductId: "openai-premium", name: "OpenAI Pro 30d",
  currency: "BDT", price: 500, costBDT: 500, availability: "IN_STOCK", attributes: { brand: "OpenAI", plan: "premium", validityDays: 30 },
  verifiedMapping: true, supplierEnabled: true, fulfillmentSupported: true, reliabilityScore: 90, ...overrides,
});

assert.equal(normalizeOfferText("OpenAI Pro 30d"), "openai premium 30 days");
assert.equal(normalizeAvailability(3), "LIMITED");
assert.equal(matchSupplierOffer(offer(), canonical).status, "HIGH_CONFIDENCE");
assert.equal(matchSupplierOffer(offer({ attributes: { brand: "Other", plan: "premium", validityDays: 30 } }), canonical).status, "NO_MATCH");

const selection = selectLowestEligibleOffer([
  offer({ supplierId: "expensive", supplierName: "Expensive", costBDT: 700 }),
  offer({ supplierId: "cheap", supplierName: "Cheap", costBDT: 400 }),
  offer({ supplierId: "disabled", supplierEnabled: false, costBDT: 100 }),
]);
assert.equal(selection.selected?.supplierId, "cheap");
assert.equal(selection.excluded.find((entry) => entry.offer.supplierId === "disabled")?.reasons[0], "supplier disabled");

console.log("supplier-intelligence checks passed");
