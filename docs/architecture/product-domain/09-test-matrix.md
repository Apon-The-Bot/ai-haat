# 09 — Cross-Domain Integration Test Matrix

## Owner: Agent 10 (Senior QA Architect & Regression Owner)

### 1. Product Type & Fulfillment Test Scenarios

| Test ID | Product Type | Variation | Fulfillment Mode | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-A** | `SUBSCRIPTION` | 1 Month (Shared) | `AUTO_STOCK` | Stock claimed atomically, OrderItem created with snapshot warranty (30d), DeliveredKey created in Vault, credentials encrypted. |
| **TEST-B** | `LICENSE_KEY` | Lifetime Retail | `AUTO_STOCK` | Unique license key claimed, DeliveredKey created with lifetime warranty (36500d), no duplicate stock reuse. |
| **TEST-C** | `WORKSPACE_ACCESS`| 1 Month Seat | `MANUAL` | Order placed, status set to `PROCESSING`, admin manual fulfillment alert dispatched, no auto-stock consumed. |
| **TEST-D** | `DOWNLOAD` | PDF Asset Pack | `PROTECTED_DOWNLOAD`| Order placed, payment verified, customer entitlement unlocks secure download URL. |
| **TEST-E** | `DIGITAL_CREDIT` | 1000 Credits | `MANUAL` | Order placed, unit quantity captured in OrderItem snapshot, admin manual completion. |
| **TEST-F** | `SERVICE` | Account Setup | `MANUAL` | Order placed, customer requirements captured, admin delivers activation. |

---

### 2. Domain Invariant Verifications

1. **Historical Price Invariant**: When a Product's price is edited from ৳500 to ৳700, orders placed prior to the edit preserve `priceBDT = 500`.
2. **Variation Override Invariant**: When Product default warranty is 7 days, but Variation overrides with 30 days, purchased `OrderItem.warrantyDaysAtPurchase` is exactly 30.
3. **Single Stock Assignment Invariant**: Under concurrent purchases for 1 available stock, exactly 1 order item succeeds in claiming stock; the second item fails gracefully without corrupting stock status.
4. **IDOR Vault Protection**: User A cannot fetch or decrypt User B's `DeliveredKey` items.
5. **After-Sales Integrity**: When an item is replaced, the original `DigitalStock` is marked `REPLACED`, a new `DeliveredKey` is provisioned, and the original delivery history is preserved.
