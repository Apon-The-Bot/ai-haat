# 03 — Product Taxonomy & Configuration Engine

## Owner: Agent 2 (Senior Product Systems Architect)

### 1. Catalog Modeling Without Custom Code
To avoid brand-specific models like `ChatGPTProduct` or `CanvaProduct`, all products are configured using the standard domain contract.

### 2. Standard Configuration Examples

#### Example A: ChatGPT Plus (Subscription with Auto-Stock or Personal Invite)
* **Product Type**: `SUBSCRIPTION`
* **Default Fulfillment**: `AUTO_STOCK`
* **Variations**:
  * Variation 1: `"1 Month - Shared Profile"`, Price: ৳290, Duration: `"30 Days"`, Fulfillment: `AUTO_STOCK` (inherits), Warranty: 30 days.
  * Variation 2: `"1 Month - Personal Email"`, Price: ৳2450, Duration: `"30 Days"`, Fulfillment: `MANUAL`, Warranty: 30 days.

#### Example B: Windows 11 Pro Retail (License Key)
* **Product Type**: `LICENSE_KEY`
* **Default Fulfillment**: `AUTO_STOCK`
* **Variations**:
  * Variation: `"1 PC - Lifetime Activation"`, Price: ৳450, Duration: `"Lifetime"`, Fulfillment: `AUTO_STOCK`, Warranty: 365 days.

#### Example C: Lovable / Cursor Workspace Seat
* **Product Type**: `WORKSPACE_ACCESS`
* **Default Fulfillment**: `MANUAL`
* **Variations**:
  * Variation: `"1 Month Seat"`, Price: ৳1200, Duration: `"1 Month"`, Fulfillment: `MANUAL` / `WORKSPACE_INVITE`, Warranty: 30 days.

#### Example D: AI Credits / Midjourney Fast Hours
* **Product Type**: `DIGITAL_CREDIT`
* **Default Fulfillment**: `MANUAL`
* **Variations**:
  * Variation: `"1000 Fast Hours Top-Up"`, Price: ৳850, Duration: null, Fulfillment: `MANUAL`, Warranty: 7 days.

#### Example E: Design Asset Bundle / E-Book
* **Product Type**: `DOWNLOAD`
* **Default Fulfillment**: `PROTECTED_DOWNLOAD`
* **Variations**:
  * Variation: `"Full Asset Pack (ZIP)"`, Price: ৳250, Duration: `"Lifetime"`, Fulfillment: `PROTECTED_DOWNLOAD`, Warranty: 30 days.

---

### 3. Display Specifications vs Functional Logic
* **Specifications Table (`Product.specifications`)**: Stored as JSON array `[{ label: "Access Method", value: "Direct Login" }, { label: "Devices", value: "1 PC / Mac" }]` for customer rendering.
* **Financial & Fulfillment Logic**: Never driven by specifications; strictly driven by typed fields (`productType`, `fulfillmentType`, `durationDays`, `warrantyDays`).
