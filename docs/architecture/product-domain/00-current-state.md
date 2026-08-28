# 00 — Current State Audit & Architectural Baseline

## Executive Summary
This document establishes the verified baseline of AI Haat (`aihaat.shop`) digital product domain architecture prior to the 10-Agent refactor.

---

## 1. Current Database Models & Schema Inventory

### 1.1 `Product` & `Variation`
* **Table `products`**: Contains identity, catalog presentation, pricing ranges (`minPriceBDT`, `maxPriceBDT`), SEO, and product defaults (`productType`, `fulfillmentType`, `warrantyDays`, `replacementAllowed`, `refundAllowed`).
* **Table `variations`**: Represents sellable SKUs linked to `Product`. Holds `priceBDT`, `salePriceBDT`, `regularPriceBDT`, and optional override fields (`fulfillmentType`, `warrantyDays`, `replacementAllowed`, `refundAllowed`, `duration`).

### 1.2 `Order` & `OrderItem`
* **Table `orders`**: Captures customer contact, payment method, payment status (`PaymentStatus`), delivery status (`DeliveryStatus`), subtotal/discount/total BDT, and marketing attribution.
* **Table `order_items`**: Contains purchase snapshots (`productName`, `variationName`, `priceBDT`, `quantity`, `warrantyDaysAtPurchase`, `refundWindowDaysAtPurchase`, `replacementAllowedAtPurchase`, `refundAllowedAtPurchase`).

### 1.3 `DigitalStock` & `DeliveredKey`
* **Table `digital_stocks`**: Stores inventory items with AES-256-GCM encrypted payload (`payloadEncrypted`), SHA-256 duplicate fingerprint (`fingerprint`), status (`StockStatus`), supplier reference, and assigned order/orderItem IDs.
* **Table `delivered_keys`**: Represents post-purchase customer entitlement and delivery records with encrypted credentials, warranty expiration date (`warrantyExpiresAt`), and replacement audit links.

### 1.4 After-Sales: `ReplacementRequest` & `Refund`
* **Table `replacement_requests`**: Tracks replacement claims against original `DeliveredKey` entries with state machine (`REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`).
* **Table `refunds`**: Tracks refund claims with method (`WALLET`, `BKASH`, `NAGAD`, etc.) and amount calculations.

---

## 2. Identified Deficiencies & Split-Brain Risks

1. **Conflated Fulfillment Enums**: `FulfillmentType` in schema contains `LICENSE_KEY`, `ACCOUNT_CREDENTIAL`, and `SUBSCRIPTION` alongside `AUTO_STOCK` and `MANUAL`. This conflates what is delivered (payload) with how it is delivered (fulfillment mode).
2. **Ad-Hoc Variation Inheritance**: Storefront (`getPublicProductBySlug`), Pricing (`pricing.ts`), Orders API (`orders/route.ts`), and Inventory (`inventory.ts`) calculate effective price, warranty, and fulfillment independently without a single centralized resolver.
3. **Unstructured Duration vs Expiry vs Warranty**: Duration is stored as loose strings (`"1 Month"`, `"1 Year"`). Warranty expiration is computed on-the-fly, but customer entitlement duration is not cleanly distinguished from pre-sale stock expiration.
4. **Static File vs MySQL Database Ambiguity**: `src/lib/products-db.ts` still has fallback logic referencing `src/data/products.ts` and `data/products.json`. In production, MySQL must remain the sole authoritative source for financial, pricing, and fulfillment decisions.
5. **Fulfillment Handler Architecture**: Auto-fulfillment logic in `inventory.ts` is coupled to database transactions without a polymorphic handler/adapter interface.
