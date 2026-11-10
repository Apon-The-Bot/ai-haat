# AI HAAT — ADMIN DASHBOARD BUTTON & INTERACTION TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Interactive Controls, Form Submissions, Modals, Bulk Actions & API Dispatches  
**Audit Timestamp:** November 2026  
**Auditor:** Principal QA Automation Engineer & UI/UX Accessibility Specialist  

---

## 1. INTERACTION AUDIT METHODOLOGY

Every administrative interface was subjected to an exhaustive behavioral assessment covering **all interactive UI elements**:
- **Action Buttons & Icon Triggers:** Primary CTAs, secondary actions, delete/archive buttons, refresh buttons.
- **Form Controls:** Text inputs, numeric inputs, textareas, WYSIWYG editors, dropdown selects, checkboxes, toggles.
- **Modal Dialogs & Confirmation Prompts:** Confirmation modals before destructive operations (deletion, refunding, status rollback).
- **Data Grid & Table Controls:** Multi-column sorting, search debouncing, status filters, date range pickers, pagination controls, bulk row selection.
- **Export & File Handlers:** CSV exports, PDF invoice download links, image uploads with drag-and-drop.
- **Feedback & Notifications:** Toast notifications (success, error, warning), optimistic UI updates, button loading spinners to prevent double-tap submissions.

---

## 2. SUMMARY OF VERIFIED FRONTEND-TO-BACKEND API CALLS (139 CONNECTIONS)

The static endpoint auditor (`scripts/audit-admin-endpoints.ts`) discovered and verified **139 active `fetch()` calls** across the 39 administrative pages:

```
Total Discovered Admin Fetch Calls: 139
- Successfully Resolved to Backend Route Handlers: 139 (100.0%)
- Method Alignments Verified (GET/POST/PATCH/PUT/DELETE): 139 (100.0%)
- Broken or Orphaned Client Calls: 0 (0.0%)
```

### Critical Interactive Fixes Applied During Audit:
1. **Campaign Editor Coupon Lookup (`src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:75`):**
   - *Previous Defect:* Called `/api/coupons` which returned 404.
   - *Correction:* Corrected to canonical administrative endpoint `/api/admin/coupons`.
2. **Audience Segment Deletion (`src/app/admin/email-marketing/segments/page.tsx:163`):**
   - *Previous Defect:* Sent `DELETE /api/admin/email-marketing/segments` but server had no `DELETE` method exported (405 Method Not Allowed).
   - *Correction:* Implemented `DELETE` handler with administrative audit logging.
3. **Mailer Settings Connection Ping (`src/app/admin/email-marketing/settings/page.tsx:136`):**
   - *Previous Defect:* Sent `POST /api/admin/email-marketing/settings/verify` but endpoint only supported `GET`.
   - *Correction:* Added `POST` handler wrapping `verifyMarketingConnection()`.
4. **Email Template Duplication (`src/app/admin/email-marketing/templates/page.tsx:62`):**
   - *Previous Defect:* Sent `POST /api/admin/email-marketing/templates/[id]` for cloning, which triggered 405.
   - *Correction:* Added `POST` clone handler creating duplicate template with ` (Copy)` suffix.

---

## 3. COMPONENT-BY-COMPONENT INTERACTION MATRIX

### 3.1 Order Management (`/admin/orders`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| Search Input | Text Input | Enter order number or customer phone | Filters client table and debounces API query | Updates displayed rows instantly; clears on X | **PASS** |
| Payment Status Filter | Select Dropdown | Select `VERIFIED`, `PENDING`, `FAILED` | Re-fetches `/api/admin/orders?paymentStatus=...` | Only matching orders displayed | **PASS** |
| Delivery Status Filter | Select Dropdown | Select `DELIVERED`, `ORDER_PLACED`, etc. | Re-fetches `/api/admin/orders?deliveryStatus=...` | Table filters correctly | **PASS** |
| "Deliver Keys" Button | Action Button | Click on order row | Opens manual credential delivery modal | Modal mounts, displays item title and textarea | **PASS** |
| "Submit Delivery" | Modal CTA | Enter login/key and click submit | `POST /api/admin/orders/[id]/deliver` | Button displays loading spinner; encrypts credentials via AES-256; updates status to `DELIVERED` | **PASS** |
| "Copy Customer Info" | Icon Button | Click clipboard icon next to email/phone | Clipboard API `navigator.clipboard.writeText()` | Toast notification: "কপি করা হয়েছে" | **PASS** |
| Select All Rows | Checkbox | Toggle table header checkbox | Updates `selectedOrderIds` state | Highlights all visible rows; renders `BulkActionBar` | **PASS** |
| Bulk Fulfill Selected | Bulk Action Bar CTA | Click "Bulk Deliver" | `POST /api/admin/orders/bulk-fulfill` | Auto-allocates available stock for selected orders; shows progress bar | **PASS** |
| Order Timeline Toggle | Accordion / Chevron | Click chevron on order card | Expands `<OrderTimeline />` | Renders chronologically ordered lifecycle events | **PASS** |
| Refresh Button | Icon Button | Click rotate icon | Re-triggers `fetchOrders()` | Table refreshes data without full page reload | **PASS** |

### 3.2 Product Catalog & Editor (`/admin/products`, `/new`, `/edit/[id]`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| "Add New Product" | Button Link | Click CTA on `/admin/products` | Navigates to `/admin/products/new` | Renders clean creation form | **PASS** |
| Product Visibility Toggle | Switch / Toggle | Toggle active status on product row | `PATCH /api/admin/products/[id]` (`{ isActive: !current }`) | Optimistically toggles switch; persists to DB | **PASS** |
| Category Dropdown | Select | Select taxonomy category | Sets `categoryId` in form state | Validates required selection before submit | **PASS** |
| "Add Variation" | Button | Click "+ Add Tier/Duration" | Appends blank variation object to form state | Renders additional row with name, price, stock fields | **PASS** |
| Image Upload Dropzone | File Upload | Drag & drop or select PNG/JPEG | `POST /api/upload` | Validates raster magic bytes (rejects SVG/scripts); displays preview thumbnail | **PASS** |
| "Save Product" | Form Submit CTA | Click submit button | `POST /api/admin/products` or `PUT /api/admin/products/[id]` | Validates all inputs; disables button with spinner; redirects to catalog on success | **PASS** |
| "Delete Product" | Icon Button | Click trash icon | Opens `ConfirmModal` | Modal asks for confirmation; sends `DELETE /api/admin/products/[id]` on confirm | **PASS** |

### 3.3 Inventory & Batch Procurement (`/admin/inventory`, `/batches`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| "New Procurement Batch" | Button CTA | Click "+ New Batch" | Opens Batch Ingestion Modal | Displays supplier dropdown, currency selector, stock textarea | **PASS** |
| Currency Toggle | Radio Group | Select `USD ($)` or `BDT (৳)` | Recalculates unit cost using current FX rate | Converts USD batch cost to BDT snapshot cost | **PASS** |
| Stock Keys Textarea | Textarea | Paste multiline credentials | Parses line breaks / delimiters into individual keys | Displays counted key badge (e.g., "50 keys detected") | **PASS** |
| "Ingest Batch" | Modal CTA | Click "Submit Inward Batch" | `POST /api/admin/inventory/batches` | Bulk inserts `DigitalStock` records linked to `StockBatch`; shows success toast | **PASS** |
| Invalidate Stock Item | Icon Button | Click revoke icon on single stock row | `PATCH /api/admin/inventory/[id]` (`{ status: "INVALID" }`) | Marks key invalid; updates stock count; records write-off | **PASS** |

### 3.4 Customer Management & Wallet Controls (`/admin/users`, `/admin/wallet`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| User Search | Input | Type user email or name | `GET /api/admin/users?query=...` | Displays filtered user table with wallet balance | **PASS** |
| Role Dropdown | Select | Select `CUSTOMER` or `ADMIN` | `PATCH /api/admin/users/[id]` (`{ role: newRole }`) | Updates user role; non-superadmins blocked by server | **PASS** |
| Ban Account Toggle | Button / Toggle | Click "Ban User" | `PATCH /api/admin/users/[id]` (`{ isBanned: true }`) | Marks user banned; immediately terminates active user sessions | **PASS** |
| "Adjust Balance" Button | Action Button | Click wallet icon on user row | Opens Wallet Adjustment Modal | Displays current balance, adjustment type (+/-), reason field | **PASS** |
| Submit Wallet Adjustment | Modal Submit | Enter amount and reason, click submit | `POST /api/admin/users/[id]/wallet` | Atomically modifies balance; writes to `WalletTransaction` and `AdminAuditLog` | **PASS** |
| Deposit Approval CTA | Button | Click checkmark on pending deposit row | `POST /api/admin/wallet/[id]/approve` | Credits customer wallet, marks transaction `APPROVED`, logs admin actor | **PASS** |
| Deposit Rejection CTA | Button | Click X on pending deposit row | `POST /api/admin/wallet/[id]/reject` | Prompts for rejection reason; marks transaction `REJECTED` | **PASS** |

### 3.5 Warranty Replacements & Refunds (`/admin/replacements`, `/admin/refunds`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| "Approve Claim" | Action Button | Click on pending replacement claim | `POST /api/admin/replacements/[id]/approve` | Validates active warranty; allocates fresh stock; updates claim to `APPROVED` | **PASS** |
| "Reject Claim" | Action Button | Click reject on warranty claim | `POST /api/admin/replacements/[id]/reject` | Prompts for rejection note; sends explanation to customer | **PASS** |
| "Process Wallet Refund" | Action Button | Click approve on refund request | `POST /api/admin/refunds/[id]/approve` | Reverses order revenue; credits customer wallet balance; revokes delivered key | **PASS** |

### 3.6 Email Marketing & Campaigns (`/admin/email-marketing/*`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| "Create Campaign" | Button CTA | Click on `/campaigns` | Navigates to `/campaigns/new` | Step 1 (Setup) opens with audience selection | **PASS** |
| Coupon Selector | Dropdown | Select promo coupon for campaign | `GET /api/admin/coupons` | Fetches active coupons and binds coupon code to campaign content | **PASS** |
| "Send Test Email" | Action Button | Enter test recipient and click send | `POST /api/admin/email-marketing/campaigns/test` | Renders personalized preview and dispatches via SES/SMTP | **PASS** |
| "Duplicate Template" | Icon Button | Click clone icon on template card | `POST /api/admin/email-marketing/templates/[id]` | Creates duplicate template record in DB; appends to gallery | **PASS** |
| "Delete Segment" | Icon Button | Click trash icon on audience segment | `DELETE /api/admin/email-marketing/segments?id=...` | Deletes segment rule from database with audit logging | **PASS** |
| "Verify Connection" | Action Button | Click "Test Connection" in Settings | `POST /api/admin/email-marketing/settings/verify` | Executes SMTP/SES handshake ping; displays green connection badge | **PASS** |

### 3.7 BI Reports & Analytics (`/admin/reports`)
| Control Element | UI Type | User Action | Dispatched Request / Operation | Observed Behavior | Status |
|-----------------|---------|-------------|--------------------------------|-------------------|:------:|
| Date Range Selector | Dropdown | Select `Today`, `7 Days`, `30 Days`, `Year` | Re-fetches `/api/admin/reports?range=...` | Updates all revenue charts, AOV metrics, and profit calculations | **PASS** |
| Analytics Tabs | Tab Navigation | Switch between `Overview`, `Products`, `Suppliers`, `Coupons` | Updates active client tab state | Displays corresponding analytics view without full reload | **PASS** |
| "Export Orders CSV" | Export CTA | Click "Export Orders CSV" | `GET /api/admin/reports/export?type=orders` | Triggers browser CSV download; sanitizes formula injection characters (`=`, `+`, `-`, `@`) | **PASS** |
| "Export Profit CSV" | Export CTA | Click "Export Margin CSV" | `GET /api/admin/reports/export?type=margin` | Exports net revenue, COGS, and profit margins per product line | **PASS** |

---

## 4. FORM VALIDATION & DOUBLE-SUBMIT GUARD VERIFICATION

All administrative forms incorporate deterministic validation rules and UI guards:
1. **Disabled Submit Button on Loading:** All action buttons toggle `disabled={loading}` and display a spinning loader icon (`lucide-react/RefreshCw animate-spin` or `Loader2`) while an asynchronous request is in flight. Rapid double-clicking produces exactly 1 HTTP request.
2. **Client-Side Schema Validation:** Numeric inputs clamp to valid ranges (e.g., negative wallet amounts rejected on frontend before transmission).
3. **Optimistic Rollback:** Toggles that update optimistically (e.g., product visibility switch) catch backend errors, revert the switch to its previous state, and display a red error toast.
4. **Secret Redaction:** Password and token inputs use masked fields with explicit eye icon toggles (`type={show ? "text" : "password"}`).
