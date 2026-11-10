# 01 — USER MANAGEMENT DASHBOARD IMPLEMENTATION

## 1. Overview & Architectural Scope

The **Centralized User Management Dashboard** (`/admin/users`) serves as the administrative command center for discovering, filtering, inspecting, and managing all customer and staff accounts in AI Haat (`aihaat.shop`).

Unlike conventional read-only CRUD listings, this implementation integrates dynamic behavioral segmentation, real-time platform financial KPIs, multi-parameter server-side querying, bulk batch operations, and contextual quick-action modals directly linked to the underlying `UserControlService`.

---

## 2. Interface Architecture & Component Breakdown

### 2.1 File Location & Component Hierarchy
- **Page Component:** `src/app/admin/users/page.tsx`
- **Routing:** `/admin/users` (Protected by `requireRole(["SUPER_ADMIN", "ADMIN"])` in Next.js App Router)
- **API Endpoint:** `GET /api/admin/users`, `POST /api/admin/users`, `POST /api/admin/users/bulk`

### 2.2 Top-Level KPI Metric Cards
The top of the dashboard displays 5 dynamic aggregate cards computed in real-time from the database:
1. **Total Registered Users:** Total count of non-deleted customer accounts.
2. **Active Customers:** Users with verified accounts and zero active suspensions.
3. **Suspended / Banned:** Total accounts currently undergoing temporary suspension or permanent termination.
4. **Restricted Accounts:** Users with active, non-expired feature-level restrictions (e.g. purchasing or wallet disabled).
5. **Customer Wallet Liability:** Sum total of all customer wallet balances (`walletBalanceBDT`) reflecting outstanding platform financial liabilities.

---

## 3. Dynamic Behavioral Segments

The dashboard features a 1-click Segment Navigation bar allowing administrators to filter the entire user base based on actual operational criteria:

| Segment Tab | System Filter Query | Operational Use Case |
| :--- | :--- | :--- |
| **All Users** | `segment=all` | Complete customer database view. |
| **Active Users** | `segment=active` | Normal operating accounts in good standing. |
| **Suspended Users** | `segment=suspended` | Accounts under temporary freeze pending review. |
| **Permanently Banned** | `segment=banned` | Terminated accounts with revoked sessions. |
| **Feature Restricted** | `segment=restricted` | Accounts with granular blocks (e.g., checkout or wallet disabled). |
| **Recently Registered** | `segment=recently_registered` | Accounts created within the last 7 calendar days. |
| **Recently Active** | `segment=recently_active` | Accounts with recorded activity or login within 24 hours. |
| **Inactive (Dormant)** | `segment=inactive` | Accounts with no recorded activity for > 90 days. |
| **High-Value VIPs** | `segment=high_value` | Customers with lifetime spending > ৳10,000 or wallet balance > ৳5,000. |
| **Pending Orders** | `segment=pending_orders` | Users with orders in `PENDING` or `PROCESSING` state. |
| **Wallet Active** | `segment=wallet_active` | Users holding positive wallet balances. |
| **Security Alerts** | `segment=security_alerts` | Accounts flagged with failed login bursts or suspicious activity. |

---

## 4. Multi-Parameter Search & Filtering Engine

The user listing table provides instantaneous client-assisted, server-enforced search and filtering:
- **Global Search:** Case-insensitive prefix and substring matching against User ID, Full Name, Email Address, and Phone Number.
- **Account Status Filter:** `ACTIVE`, `SUSPENDED`, `BANNED`, `PENDING_VERIFICATION`, `RESTRICTED`, `DEACTIVATED`.
- **Role Filter:** `CUSTOMER`, `ADMIN`, `SUPER_ADMIN`, `SUPPORT`, `AFFILIATE`.
- **Email / Phone Verification:** Filter by verified vs unverified identities.
- **Wallet Balance Thresholds:** Minimum and maximum BDT balance filters.
- **Sorting Options:** By Registration Date, Last Active, Wallet Balance, Lifetime Spending, or Total Orders (Ascending / Descending).
- **Pagination:** Configurable page size (15, 30, 50, 100 users per page) with full offset pagination and total record counters.

---

## 5. Security & Privacy Safeguards in the User Listing

1. **Zero Credential Exposure:** Plaintext passwords, password hashes (`hashedPassword`), OTP secrets, and MFA secret seeds are strictly excluded from the `select` projection in `src/app/api/admin/users/route.ts`.
2. **Masked Phone Identifiers:** Phone numbers are formatted and sanitized before rendering.
3. **Session Revocation Indicators:** Accounts with expired or invalidated tokens display real-time session status badges.
4. **Two-Factor Authentication Badges:** Visual badges indicate whether customer 2FA is enabled without revealing private authenticator details.

---

## 6. Administrative Modals & Interactive Workflows

### 6.1 Add New Customer Modal
- **Purpose:** Onboards new customers directly through admin intervention.
- **Fields:** Full Name, Email, Phone Number, Initial Password, User Role, Verification Status, Send Invitation Email checkbox.
- **Validation:** Server verifies email uniqueness and phone format before insertion.

### 6.2 Quick Status Change Modal
- **Purpose:** Fast-track account suspension, banning, or restoration without leaving the listing view.
- **Inputs:** Status selection, Duration (hours/days or permanent), Mandatory Administrative Reason, User Notification toggle.
- **Enforcement:** Dispatches `POST /api/admin/users/[id]/status` and logs to `AdminAuditLog` and `UserActivityLog`.

### 6.3 Quick Wallet Adjustment Modal
- **Purpose:** Facilitates rapid balance credit or debit with financial ledger guarantees.
- **Inputs:** Action (Credit/Debit), Amount in BDT, Ledger Category (Manual Adjustment, Goodwill, Promotional, Correction), Mandatory Justification Reason, Reference Number.
- **Safety:** Verifies available balance on debits to prevent negative balances; requires dual-click confirmation.

### 6.4 Controlled Bulk Operations Bar
Appears automatically when one or more users are checked in the table:
- **Selected Counter:** Real-time count of affected users.
- **Actions Supported:** Bulk Suspend, Bulk Restore, Bulk Apply Feature Restriction, Bulk Tagging, and Export to CSV.
- **Execution:** Calls `POST /api/admin/users/bulk` with atomic per-user error handling, returning success/failure breakdowns.
- **Export Sanitization:** The CSV export generates RFC 4180-compliant CSV with sanitized fields to prevent CSV formula injection.
