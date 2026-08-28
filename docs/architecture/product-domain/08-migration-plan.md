# 08 — Migration Plan & Legacy Data Reconciliation

## Owner: Agent 9 (Senior Production Migration Engineer)

### 1. Data Classification & Inventory

| Data Source | Status | Authoritative Target | Strategy |
| :--- | :--- | :--- | :--- |
| **MySQL `products` & `variations`** | Active | MySQL `products` & `variations` | Primary production source of truth. |
| **MySQL `orders` & `order_items`** | Active | MySQL `orders` & `order_items` | Retain all historical items. Backfill default warranty/fulfillment if null. |
| **MySQL `delivered_keys`** | Active | MySQL `delivered_keys` | Migrate legacy plaintext credentials to AES-256-GCM. |
| **Static `src/data/products.ts`** | Legacy Fallback | Seed / Demo Fixtures | Sync missing products to MySQL database. Eliminate runtime pricing authority. |
| **Local JSON `data/products.json`** | Dev Fallback | Sync to MySQL | Backup only; never override MySQL in production. |

---

### 2. Expand-and-Contract Migration Protocol
1. **Expand**: Add any missing columns/indexes safely with nullable defaults.
2. **Backfill**: Ensure all legacy orders and products have proper `productType`, `fulfillmentType`, `warrantyDaysAtPurchase`.
3. **Switch Reads**: Storefront, pricing, checkout, and vault query MySQL database exclusively.
4. **Switch Writes**: Product creations, updates, and orders write to MySQL database.
5. **Contract**: Maintain JSON backups as secondary telemetry/disaster recovery without conflicting with database truth.

---

### 3. Data Reconciliation Checks
* Total Products Count in DB vs Catalog.
* Total Variations Count linked to active products.
* Historical OrderItems integrity (no orphaned references).
* Total DeliveredKey items with valid encryption and warranty dates.
