# 01 — Frozen Shared Domain Architecture Contract

## 1. Domain Separation of Concerns

The AI Haat Digital Product Domain is governed by four orthogonal concepts:

| Dimension | Question Answered | Canonical Enums / Types |
| :--- | :--- | :--- |
| **Product Type** | What kind of commercial product is this? | `SUBSCRIPTION`, `LICENSE_KEY`, `ACCOUNT`, `DIGITAL_CREDIT`, `WORKSPACE_ACCESS`, `DOWNLOAD`, `SERVICE` |
| **Fulfillment Mode** | How does AI Haat provide/deliver the product? | `AUTO_STOCK`, `MANUAL`, `PROTECTED_DOWNLOAD`, `WORKSPACE_INVITE`, `EXTERNAL_ACTIVATION` |
| **Inventory Mode** | Does AI Haat consume a pre-existing stock unit? | `STOCK_REQUIRED` (must have `DigitalStock`), `NO_STOCK` (provisioned on demand), `ASSET_HOSTED` |
| **Delivery Payload** | What payload format does the customer receive? | `ACCOUNT_CREDENTIAL`, `LICENSE_KEY`, `DOWNLOAD_LINK`, `ACCESS_INSTRUCTIONS`, `CUSTOM` |

> [!IMPORTANT]
> A product or variation MUST NOT combine these concepts into single monolithic enums (e.g. `CHATGPT_SHARED_ACCOUNT_30_DAYS_AUTO` is strictly forbidden).

---

## 2. Supported Product Type & Fulfillment Matrix

| Product Type | Allowed Fulfillment Modes | Inventory Requirement | Expected Delivery Payload | Duration Semantics | Warranty Support |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`SUBSCRIPTION`** | `AUTO_STOCK`, `MANUAL`, `WORKSPACE_INVITE` | `STOCK_REQUIRED` (if AUTO) / None (if MANUAL) | `ACCOUNT_CREDENTIAL` or `ACCESS_INSTRUCTIONS` | Required (e.g., 30d, 90d, 365d) | Supported (1–365 days) |
| **`LICENSE_KEY`** | `AUTO_STOCK`, `MANUAL` | `STOCK_REQUIRED` (if AUTO) | `LICENSE_KEY` | None (Lifetime) or Fixed Duration | Supported (1–36500 days) |
| **`ACCOUNT`** | `AUTO_STOCK`, `MANUAL` | `STOCK_REQUIRED` (if AUTO) | `ACCOUNT_CREDENTIAL` | Optional / Lifetime / Fixed | Supported |
| **`WORKSPACE_ACCESS`**| `MANUAL`, `WORKSPACE_INVITE`, `AUTO_STOCK` | Optional | `ACCESS_INSTRUCTIONS` / `ACCOUNT_CREDENTIAL` | Required (Duration of seat) | Supported |
| **`DIGITAL_CREDIT`** | `MANUAL`, `EXTERNAL_ACTIVATION` | None | `ACCESS_INSTRUCTIONS` / `LICENSE_KEY` | None (Unit-based quantity) | Supported |
| **`DOWNLOAD`** | `PROTECTED_DOWNLOAD` | `ASSET_HOSTED` | `DOWNLOAD_LINK` | None (Permanent download access)| Supported |
| **`SERVICE`** | `MANUAL` | None | `ACCESS_INSTRUCTIONS` | Optional / Service turnaround SLA | Supported |

---

## 3. Central Resolution Contract (`resolveProductConfiguration`)

For any sellable item, all subsystems (Storefront, Cart, Checkout, Pricing, Fulfillment, Orders) MUST call the authoritative resolver:

```typescript
export interface ResolvedProductConfig {
  productId: string;
  variationId: string | null;
  productName: string;
  variationName: string;
  productSlug: string;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  priceBDT: number;
  regularPriceBDT: number;
  salePriceBDT: number | null;
  costPriceBDT: number | null;
  duration: string | null;
  durationDays: number | null;
  warrantyDays: number;
  replacementAllowed: boolean;
  refundAllowed: boolean;
  refundWindowDays: number;
  requiresInventory: boolean;
  inStock: boolean;
  deliverySla: string;
  image: string;
}
```

### Inheritance Rules:
1. **Price**: If `variation.salePriceBDT` is set and `< variation.regularPriceBDT`, effective price is `salePriceBDT`. Else `variation.priceBDT`. If single product, uses product-level pricing.
2. **Fulfillment Type**: If `variation.fulfillmentType` is set, it overrides `product.fulfillmentType`. Otherwise inherits `product.fulfillmentType`.
3. **Warranty Days**: If `variation.warrantyDays` is set (> 0), overrides `product.warrantyDays`. Otherwise inherits `product.warrantyDays` (default 30).
4. **Replacement & Refund Flags**: Variation nullable booleans override product-level booleans when non-null; otherwise inherit.
5. **Duration Days**: Resolved via deterministic parser (`parseDurationToDays(duration)`):
   * `"1 Month"` / `"1 মাস"` / `"30 Days"` $\rightarrow$ 30 days
   * `"3 Months"` $\rightarrow$ 90 days
   * `"6 Months"` $\rightarrow$ 180 days
   * `"1 Year"` / `"12 Months"` $\rightarrow$ 365 days
   * `"Lifetime"` $\rightarrow$ 36500 days
   * Numeric day string $\rightarrow$ $N$ days

---

## 4. Immutable Purchase Contract (`OrderItem` Snapshot)

At order creation time, the following snapshot fields MUST be recorded into `OrderItem` to protect past orders from future product changes:

* `productId`, `variationId`
* `productName`, `variationName`
* `priceBDT` (unit price at purchase)
* `quantity`
* `deliveryStatus`
* `fulfillmentType` (resolved fulfillment mode)
* `warrantyDaysAtPurchase` (snapshot warranty)
* `refundWindowDaysAtPurchase` (snapshot refund window)
* `replacementAllowedAtPurchase`
* `refundAllowedAtPurchase`
* `image`

---

## 5. Distinction: Duration vs Expiry vs Warranty

| Concept | Entity | Meaning | Calculation Reference |
| :--- | :--- | :--- | :--- |
| **Inventory Expiry** | `DigitalStock.expiryDate` | When the unsold stock credential becomes invalid from supplier. | Pre-sale supplier expiration. |
| **Customer Entitlement Expiry**| `DeliveredKey.customerExpiresAt` | When the customer's subscription or access period terminates. | `deliveredAt + durationDays` |
| **Warranty Expiry** | `DeliveredKey.warrantyExpiresAt` | When the customer's right to claim a free replacement expires. | `deliveredAt + warrantyDays` |
| **Refund Window Expiry** | Derived from `OrderItem` | When the customer's right to request a refund expires. | `order.createdAt / deliveredAt + refundWindowDays` |

---

## 6. Security & Data Integrity Boundaries

1. **Credentials at Rest**: All digital credentials in `DigitalStock.payloadEncrypted` and `DeliveredKey.credentialsEncrypted` MUST be encrypted using centralized AES-256-GCM (`src/lib/mfa/crypto.ts`).
2. **Unique Stock Assignment**: `claimAvailableStock` MUST use atomic database updates (`status: "AVAILABLE"` $\rightarrow$ `"DELIVERED"`) within a transaction to eliminate stock assignment race conditions.
3. **Public API Sanitization**: Public Product DTOs MUST NEVER expose `costPriceBDT`, `payloadEncrypted`, `fingerprint`, supplier information, or admin notes.
4. **Idempotency**: All fulfillment handlers and auto-fulfillment calls must verify if `DeliveredKey.count >= OrderItem.quantity` before claiming new stock to avoid duplicate deliveries upon retry.
