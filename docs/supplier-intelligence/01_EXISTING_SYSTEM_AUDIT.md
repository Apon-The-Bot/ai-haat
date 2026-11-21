# Existing system audit

Audit date: 2026-11-22. This is a source-level audit; no production migration or purchase was executed.

## Verified platform baseline

- Next.js 15 App Router, React 18, TypeScript, Prisma 5.19, MySQL.
- Admin MFA/RBAC is enforced through `requireAdminMfa` and related guards.
- Existing supplier catalog ingestion is implemented in `src/lib/provider-catalog.ts` and supports 35 provider identifiers, environment-backed credentials, public endpoints where configured, bounded pagination, 15-second request timeouts, response validation, currency normalization for known currencies, stock/availability states, and sanitized catalog rows.
- `src/lib/provider-catalog-store.ts` persists provider snapshots and sync history with a five-minute lease to prevent concurrent catalog syncs.
- Existing supplier persistence includes `Supplier`, `ProductSupplier`, `SupplierWebhookLog`, inventory-batch supplier references, digital-stock supplier references, and order-item cost records.
- Existing inventory is authoritative for fulfillment: `DigitalStock`, `InventoryBatch`, atomic stock claiming, encrypted credentials, duplicate fingerprints, and expiry checks are implemented.
- Existing fulfillment uses `StockFulfillmentHandler`, `ManualFulfillmentHandler`, and `ProtectedDownloadHandler` behind a common dispatch contract with order-item idempotency checks.
- Existing pricing and finance code includes server-side order quoting, BDT conversion helpers, projected margins, realized COGS, refunds, replacements, and cost coverage reporting.
- Existing notification infrastructure includes `NotificationEvent`, `NotificationDelivery`, in-app/email/Telegram channels, retries, deduplication keys, and admin notification views.

## Supplier capability matrix

| Capability | Verified in repository | Notes |
| --- | --- | --- |
| Catalog fetch | Yes | Provider-specific endpoints and response extraction exist |
| Pagination | Yes for configured providers | Page/cursor validation and maximum page bound exist |
| Currency normalization | Partial | USD, BDT, USDT, GHS, RUB and provider-specific mappings exist; FX is configured/static, not a live rate service |
| Numeric stock | Partial | Provider responses may yield numeric, boolean, unlimited, or unknown availability |
| Product variants | Partial | Some providers expose variants/tiers; no canonical variant persistence exists |
| Catalog snapshot | Yes | `ProviderCatalogSnapshot` |
| Sync history/lease | Yes | `ProviderCatalogSync` |
| Supplier order creation | Not verified | No common external order adapter was found |
| Supplier order status | Not verified | No common reconciliation adapter was found |
| Supplier webhook verification | Partial | Supplier stock ingestion and logs exist; provider-specific webhook signatures are not universal |
| Rate-limit/circuit breaker | Partial | Timeouts and bounded pagination exist; no general provider circuit breaker was found |

## Main gaps

1. Provider catalog rows are normalized for display but not persisted as supplier products/offers with stable canonical identities.
2. `ProductSupplier` is a manual mapping/cost relation, not a full offer model with availability freshness, match confidence, or mapping history.
3. No deterministic canonical matching/review queue exists.
4. Supplier selection is not a shared explainable engine across mapped offers.
5. No verified external supplier purchase adapter exists, so automated supplier fulfillment must remain disabled.
6. No new schema migration is safe to apply until the previously observed pending migration chain is handled through the approved deployment process.

## Reuse and safety constraints

The implementation should extend provider catalog snapshots, `ProductSupplier`, inventory, order-item costs, fulfillment handlers, audit logs, and notification outbox behavior. It must not expose supplier credentials, treat unknown stock as available, change paid order amounts, or claim external fulfillment support without provider-specific evidence.
