# 02 — Shared Test Fixture Contract

## 1. Deterministic Fixture Factory
All QA suites consume fixtures generated through a unified helper (`scripts/qa-fixtures.ts`).

### Standard Entities:
* **`CustomerUserFixture`**: `id: "qa-user-cust-A-${ts}"`, `email: "qa_cust_a_${ts}@aihaat.shop"`, `role: "USER"`.
* **`VictimUserFixture`**: `id: "qa-user-cust-B-${ts}"`, `email: "qa_cust_b_${ts}@aihaat.shop"`, `role: "USER"`.
* **`AdminUserFixture`**: `id: "qa-user-admin-${ts}"`, `email: "qa_admin_${ts}@aihaat.shop"`, `role: "ADMIN"`.
* **`ProductSubscriptionFixture`**: `productType: "SUBSCRIPTION"`, `fulfillmentType: "AUTO_STOCK"`, `priceBDT: 500`.
* **`ProductLicenseFixture`**: `productType: "LICENSE_KEY"`, `fulfillmentType: "AUTO_STOCK"`, `priceBDT: 450`.
* **`ProductManualFixture`**: `productType: "WORKSPACE_ACCESS"`, `fulfillmentType: "MANUAL"`, `priceBDT: 1200`.
* **`CouponFixture`**: `code: "QA-SAVE-50-${ts}"`, `discountPercent: 10`, `maxUses: 1`.
* **`DigitalStockFixture`**: Encrypted payload with AES-256-GCM and unique SHA-256 fingerprint.

---

## 2. Lifecycle Cleanup Protocol
Every test registers its created primary keys into a `TestTracker` instance.
On suite completion (or failure), the cleanup lifecycle deletes entities in strict reverse dependency order:
1. `DeliveredKey`
2. `ReplacementRequest`
3. `OrderItem`
4. `Order`
5. `DigitalStock`
6. `Variation`
7. `Product`
8. `WalletTransaction`
9. `Notification`
10. `SupportMessage` & `SupportTicket`
11. `Coupon`
12. `User`
