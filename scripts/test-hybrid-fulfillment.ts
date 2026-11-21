import assert from "node:assert/strict";
import { resolveFulfillmentPolicy } from "../src/lib/supplier-intelligence/fulfillment-policy";
import type { SupplierOffer } from "../src/lib/supplier-intelligence/types";

const offer = (id: string, costBDT: number, fulfillmentSupported: boolean): SupplierOffer => ({
  supplierId: id, supplierName: id, externalProductId: id, name: "Canonical product", currency: "BDT", price: costBDT, costBDT,
  availability: "IN_STOCK", attributes: {}, verifiedMapping: true, supplierEnabled: true, fulfillmentSupported, reliabilityScore: 90,
});

const base = { global: { mode: "MANUAL" as const }, offers: [offer("manual-cheap", 400, false), offer("auto-safe", 500, true)], sellingPriceBDT: 900 };
assert.equal(resolveFulfillmentPolicy({ ...base, variant: { mode: "AUTOMATIC" } }).effectiveMode, "AUTOMATIC");
assert.equal(resolveFulfillmentPolicy({ ...base, variant: { mode: "AUTOMATIC" } }).selectedSupplier?.supplierId, "auto-safe");
assert.equal(resolveFulfillmentPolicy({ ...base, variant: { mode: "AUTOMATIC" }, emergencyAutomaticStop: true }).effectiveMode, "MANUAL");
assert.equal(resolveFulfillmentPolicy({ ...base, variant: { mode: "AUTOMATIC" }, offers: [offer("manual-only", 300, false)] }).requiresManualReview, true);
assert.equal(resolveFulfillmentPolicy({ ...base, variant: { mode: "AUTOMATIC", maximumAutomaticPurchaseBDT: 450 }, expectedCostBDT: 500 }).effectiveMode, "MANUAL");
console.log("hybrid fulfillment checks passed");
