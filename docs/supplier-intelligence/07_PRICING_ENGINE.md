# Pricing engine

Current pricing and quote behavior remains in `src/lib/commerce/pricing.ts` and cost conversion in `src/lib/commerce/costing.ts`. Supplier intelligence currently supplies no customer-facing price override. Any future margin rule must preserve server-side quote validation, coupon behavior, currency snapshots, and auditability.
