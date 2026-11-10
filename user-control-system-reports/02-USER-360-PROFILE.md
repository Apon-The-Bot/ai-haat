# 02 — USER 360° PROFILE CONTROL CENTER

## 1. Executive Summary

The **User 360° Profile Control Center** (`/admin/users/[id]`) transforms customer profile management into a unified command console. Instead of fragmenting customer data across orders, transactions, authentication logs, and support desks, the 360° view synthesizes all customer dimensions into a single reactive interface structured across 11 specialized operational tabs.

---

## 2. Technical Architecture

- **Frontend Route:** `/admin/users/[id]` (`src/app/admin/users/[id]/page.tsx`)
- **Backend API:** `GET /api/admin/users/[id]` (`src/app/api/admin/users/[id]/route.ts`)
- **Access Control:** Enforced server-side via `requireRole(["SUPER_ADMIN", "ADMIN"])`.
- **State Management:** Reactive tab state with deep-link URL preservation and live data refresh upon mutation.

---

## 3. Persistent Profile Header & Financial KPI Strip

Regardless of the active tab, the header maintains vital customer context:
- **Identity & Verification Strip:**
  - Customer avatar with fallback monogram.
  - Full Name, Primary Email Address, and Phone Number.
  - Unique System User ID (`c...` or UUID) with 1-click clipboard copy.
  - Role Badge (`SUPER_ADMIN`, `ADMIN`, `CUSTOMER`, `SUPPORT`, `AFFILIATE`).
  - Real-Time Status Badge (`ACTIVE`, `SUSPENDED`, `BANNED`, `RESTRICTED`, `DEACTIVATED`).
  - Security Indicators: Email Verified, Phone Verified, Two-Factor Authentication (2FA) status.
- **Financial Metric Cards:**
  - **Wallet Balance:** Live spendable balance in BDT (`৳`).
  - **Total Orders:** Count of all placed lifetime orders.
  - **Lifetime Spending:** Sum of paid orders in BDT.
  - **Total Refunds:** Aggregate refunded BDT volume.
  - **Loyalty Coins:** Available coin balance for checkout redemption.
  - **Affiliate Balance:** Accrued commissions from referral purchases.
- **Contextual Quick Actions:**
  - `Adjust Wallet`: Opens financial adjustment dialog.
  - `Restrict Feature`: Opens granular entitlement modal.
  - `Suspend / Ban`: Triggers immediate access termination flow.
  - `Revoke Sessions`: Instantly invalidates all active sessions.

---

## 4. The 11 Specialized Operational Tabs

### Tab 1 — Overview
- **Purpose:** Executive operational summary of the customer's relationship with AI Haat.
- **Contents:**
  - Personal Information summary card (joined date, last active, identity verification).
  - Active Restrictions summary card (listing all active feature-level blocks and expiration timers).
  - Financial Health summary (lifetime deposits, lifetime debits, net platform value).
  - High-priority security alerts (e.g. recent IP changes, failed password attempts).
  - Recent 5 activity timeline events.

### Tab 2 — Personal Information
- **Purpose:** Authorized profile maintenance and customer data rectification.
- **Fields:** Full Name, Email Address, Phone Number, Profile Image URL.
- **Validation:** Server verifies email uniqueness and phone syntax.
- **Audit:** Any modification generates a before/after audit entry in `AdminAuditLog` recording the modifying administrator.

### Tab 3 — Account Status & Access Control
- **Purpose:** Master account lifecycle management.
- **Controls:**
  - Switch status between `ACTIVE`, `SUSPENDED`, `BANNED`, `RESTRICTED`, `DEACTIVATED`.
  - Set suspension duration (Hours, Days, or Indefinite).
  - Mandatory administrative justification input.
  - Notification dispatch toggle.
- **Audit & History:** Full chronological timeline of previous status changes with admin signatures and reasons.

### Tab 4 — Features & Entitlements
- **Purpose:** Granular per-user control over all 23 application capabilities.
- **Features Controlled:** Catalog Browsing, Checkout, Order Placement, Wallet Payments, MFS Recharges, License Key Viewing, Shared Account Credentials, Vault, Gift Claims, Coupons, Loyalty Coins, Affiliate Program, Support Tickets, etc.
- **Control Modifiers:** Full block toggle, action-level restriction, daily limit, spending limit in BDT, and auto-expiration timestamp.

### Tab 5 — Wallet & Financial Control
- **Purpose:** Real-time ledger inspection and atomic balance management.
- **Components:**
  - Balance breakdown (Available BDT, Locked BDT).
  - Manual Adjustment Module (Credit / Debit with mandatory category and justification).
  - Immutable Transaction Ledger: Table of all deposits, purchases, refunds, and manual adjustments with reference numbers and balance snapshots.

### Tab 6 — Orders & Purchases
- **Purpose:** Unified view of customer purchasing history.
- **Features:**
  - Complete list of orders with Order Number, Date, Status (`PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`, `REFUNDED`), Total BDT, and Payment Method.
  - Order details drilldown showing line items, product variations, and fulfillment timestamps.
  - Admin controls for manual order cancellation and refund initiation.

### Tab 7 — Digital Products & Credentials
- **Purpose:** Safe inspection and management of delivered digital assets.
- **Security Safeguards:**
  - Software license keys and shared profile credentials are masked by default (`••••••••••••••••••••••••`).
  - **Audited Reveal Mechanism:** Viewing a plaintext key requires the admin to submit a business reason. This action dispatches `POST /api/admin/users/[id]/reveal-credential` and logs `CREDENTIAL_REVEALED_BY_ADMIN` to the immutable audit log.
  - Admin key reassignment and invalidation controls.

### Tab 8 — Loyalty & Referrals
- **Purpose:** Customer loyalty reward and affiliate program management.
- **Components:**
  - Loyalty coin balance, coin earning history, and redemption ledger.
  - Customer affiliate code, referral link, total clicks, attributed orders, and earned commissions.
  - Ability to freeze affiliate commission payouts in fraud investigations.

### Tab 9 — Sessions & Security
- **Purpose:** Active session inspection, security monitoring, and access termination.
- **Components:**
  - Active user sessions with IP address, browser/OS user agent, and last activity timestamp.
  - List of trusted devices with hardware fingerprints.
  - One-click `Revoke Session` and `Revoke All Sessions` actions.
  - Trigger forced password reset email.

### Tab 10 — Administrative Notes & Tags
- **Purpose:** Private staff collaboration and customer segmentation.
- **Features:**
  - **Internal Admin Notes:** Threaded internal notes visible ONLY to administrators. Never exposed in any customer-facing API. Supports tagging notes as `CRITICAL`, `BILLING`, or `GENERAL`.
  - **Customer Tags:** Badges assigned to users (e.g. `VIP`, `HIGH_RISK`, `FRAUD_SUSPECT`, `INFLUENCER`, `WHOLESALER`).

### Tab 11 — Activity Timeline & Analytics
- **Purpose:** Comprehensive chronological audit trail of all customer interactions.
- **Features:**
  - Granular event timeline capturing logins, logouts, product views, cart additions, checkout attempts, order completions, wallet transactions, and security alerts.
  - Filterable by event category: `AUTH`, `COMMERCE`, `FINANCIAL`, `SECURITY`, `ADMIN_ACTION`.
  - Timestamped with precise Bangladeshi Standard Time (BST) display.
