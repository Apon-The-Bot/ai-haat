# 01 — Shared Test Contract & Invariants

## 1. Core Testing Principles
1. **Test Business Invariants, Not Implementation Trivia**: Focus on financial safety, data privacy, idempotency, and concurrency resilience.
2. **Deterministic Data**: All test data must use unique prefixes (e.g. `TEST-QA-${timestamp}-${uuid}`) and be self-contained.
3. **Strict Production Database Guard**: Suites must verify the database target before running setup or teardown. Never run destructive operations against unknown live production databases.
4. **Mock at External Boundaries Only**: Mock payment network APIs, SMTP servers, and Telegram webhooks. Never mock the core business logic or database transactions under test.

---

## 2. The 18 Critical Business Invariants
1. **IDOR Defense**: Customer A cannot read or mutate Customer B's orders, vault keys, wallet balance, support tickets, notifications, or refunds.
2. **Server Pricing Truth**: Browser/API cannot tamper with unit price or arbitrarily apply discounts without a valid coupon.
3. **Payment Verification Gate**: Fake payment callbacks or unverified webhooks cannot mark an order as paid or trigger delivery.
4. **Payment Idempotency**: Duplicate payment webhooks or replay attacks cannot create duplicate deliveries or double wallet credits.
5. **Callback Race Condition**: Simultaneous webhook and browser callback transitions the order to `VERIFIED` exactly once.
6. **Wallet Double-Spend Prevention**: Concurrent wallet debits cannot exceed the current balance or cause negative balance.
7. **Recharge Replay Defense**: Replaying the same recharge transaction hash cannot credit wallet balance multiple times.
8. **Single-Stock Assignment Invariant**: One digital inventory stock item can never be delivered to two different buyers.
9. **No Pre-Payment Fulfillment**: Auto-delivery can only trigger after database payment state is `VERIFIED`.
10. **Multi-Item Order Completeness**: Orders with multiple items must snapshot and fulfill each line item independently according to its policy.
11. **Historical Snapshot Immutability**: Editing product catalog prices, titles, or warranty durations cannot alter historical `OrderItem` snapshots.
12. **Refund Cap Invariant**: Total refund cannot exceed the net paid line-item amount.
13. **Replacement Stock Safety**: Defective stock replaced during warranty must be transitioned to `REPLACED` and never reassigned as `AVAILABLE`.
14. **Role Authorization**: Standard authenticated customers cannot execute admin endpoints (returns 403/401).
15. **MFA Step-Up Protection**: Admin-sensitive actions (payout approvals, refunds, manual stock delivery) require valid MFA session tokens.
16. **Credential Privacy**: Generic public and customer APIs must never leak encrypted payloads, inventory fingerprints, supplier IDs, or internal costs.
17. **Private Route Protection**: Dashboard, vault, and admin routes must reject unauthenticated requests.
18. **Analytics Financial Integrity**: `Purchase` analytics events must only fire on server-verified orders and deduplicate on repeat page visits.
