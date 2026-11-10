# AI HAAT — USER 360° IMPLEMENTATION ARCHITECTURE
**Document ID:** REPORT-03  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Full architectural breakdown, component hierarchy, data flow, and functional specifications of the User 360° Profile Console (`/admin/users/[id]`).

---

## 1. Architectural Overview

The AI Haat User 360° Console (`src/app/admin/users/[id]/page.tsx`) transforms administrative customer care and security operations from fragmented screens into a single pane of glass. It aggregates data across 8 dedicated relational tables, core commerce models (`Order`, `OrderItem`, `DigitalDeliveryItem`, `WalletTransaction`), customer communications (`SupportTicket`, `Notification`), and security telemetry.

```
                      ┌───────────────────────────────────────┐
                      │    Admin 360° Console Controller      │
                      │  (src/app/admin/users/[id]/page.tsx)  │
                      └──────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
┌───────────────────────────────┐                       ┌─────────────────────────────────┐
│     Core Identity & Stats     │                       │     User Intelligence Panel     │
│  - Persistent Identity Banner │                       │ (components/admin/UserIntell...)│
│  - Financial Summary Cards    │                       │  - Device & Client Instances    │
│  - Quick Lifecycle Controls   │                       │  - IP, Network & ASN Telemetry  │
│  - Staff Tags & Pinned Notes  │                       │  - Approx IP vs Consented GPS   │
└───────────────┬───────────────┘                       │  - Session Health & Revocation  │
                │                                       │  - Client Web Vitals            │
                │                                       │  - Privacy & Consent Ledger     │
                │                                       └─────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           18 Major Operational Sections                                │
│ [Overview] [Orders & Licenses] [Wallet Ledger] [Restrictions] [Intelligence] [Support] │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 18 Major Operational Sections

### Section 1: Identity & Profile Header
- **Component:** Top persistent banner displaying user avatar, name, email, role badge (`USER`, `RESELLER`, `ADMIN`), status badge (`ACTIVE`, `SUSPENDED`, `BANNED`), user CUID, creation date, and last seen timestamp.
- **Actions:** Quick links to edit profile, impersonate in Safe Support Mode, and open status change modal.

### Section 2: Account Lifecycle & Status Controls
- **Component:** Lifecycle state manager. Allows toggling between `ACTIVE`, `SUSPENDED`, `BANNED`, `PENDING_VERIFICATION`, and `DEACTIVATED`.
- **Enforcement:** Requires mandatory justification reason. If temporary suspension is selected, an expiration date is enforced. All active sessions are immediately invalidated when transitioning to `SUSPENDED` or `BANNED`.

### Section 3: Feature Permissions & Granular Restriction Engine
- **Component:** 23-feature entitlement matrix. Lists each system feature with its active policy: `ACTIVE`, `DISABLED`, `READ_ONLY`, or `LIMIT_USAGE`.
- **Restriction Impact Simulator:** Interactive preview within the restriction modal showing administrators the exact customer-facing error message, blocked UI elements, and API response behavior before enacting a policy.

### Section 4: Wallet & Balance Ledger
- **Component:** Double-entry wallet console showing current balance in BDT, cumulative lifetime top-ups, and ledger statement.
- **Admin Adjustments:** Supports atomic credits and debits with mandatory audit reason. Debits are prevented from causing negative balances.

### Section 5: Orders, Invoices & Purchase History
- **Component:** Paginated order ledger displaying order IDs, transaction timestamps, items purchased, totals in BDT, payment status, and fulfillment state (`COMPLETED`, `PENDING`, `CANCELLED`).
- **Deep Linking:** Direct links to complete order details and printable invoice generation.

### Section 6: Digital Goods & License Key Vault
- **Component:** Digital product entitlement vault listing software downloads, credentials, and product license keys.
- **Audited Reveal Protocol:** Keys are masked by default (`XXXX-XXXX-XXXX-1A2B`). Clicking "Reveal" triggers a modal prompting for administrative reason, calling `/api/admin/users/[id]/reveal-credential` and recording an immutable audit log.

### Section 7: Client Device & Environment Intelligence
- **Component:** Fingerprint-free device telemetry tab. Displays device type (`DESKTOP`, `MOBILE`), friendly names, browser family/version, OS, platform, and screen resolution.
- **Privacy Assurance:** Zero covert canvas, audio, or battery fingerprinting. Device tracking uses non-persistent random client tokens (`dev_instance_...`).

### Section 8: IP & Network Diagnostics
- **Component:** Network intelligence viewer displaying resolved client IP, protocol (`IPv4`/`IPv6`), ISP name, Autonomous System Number (ASN), and proxy/datacenter detection flags.
- **Security Signals:** Badges highlighting high-risk hosting/VPN infrastructure.

### Section 9: Geolocation Mapping (Approximate IP vs Consented GPS)
- **Component:** Dual-layer location interface distinguishing between approximate IP-derived location (Country, City, ISP) and high-accuracy GPS coordinates.
- **Consent Gate:** GPS coordinates are strictly collected only if affirmative `LOCATION_GPS` consent has been granted.

### Section 10: Session Management & Force Sign-out
- **Component:** Active session monitor showing active session tokens, IP addresses, user-agents, and last active timestamps.
- **Emergency Action:** One-click "Revoke All Active Sessions" button immediately invalidates all active sessions for the user.

### Section 11: Web Vitals & Client Telemetry
- **Component:** Performance telemetry cards visualizing real client experience metrics (LCP, FID, CLS, TTFB) ingested via bounded performance reporting.

### Section 12: Privacy, Consent & GDPR Compliance Ledger
- **Component:** Regulatory audit log listing user consents (`LOCATION_GPS`, `MARKETING_EMAIL`, `ANALYTICS_COOKIES`) with timestamps, affirmative status, and IP proof of consent.

### Section 13: Customer Support Tickets & Inquiries
- **Component:** Support ticket thread timeline displaying ticket IDs, subjects, priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), status (`OPEN`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`), and assigned agent.

### Section 14: Internal Staff Notes & Pinned Flags
- **Component:** Staff collaboration thread. Administrators can post categorized internal notes (`GENERAL`, `SUPPORT`, `FRAUD_RISK`, `FINANCIAL`) and pin critical warnings to the top of the user's profile.
- **Security:** Notes are strictly stored in `user_admin_notes` and never exposed via any customer-facing endpoint.

### Section 15: Dynamic Customer Segmentation & Tags
- **Component:** Real-time customer tagging widget. Admins can assign and remove tags (e.g. `VIP`, `High Risk`, `Wholesale Reseller`, `Verified Corporate`). Automated rules can also attach tags dynamically.

### Section 16: Security Anomalies & Automated Threat Rules
- **Component:** Threat intelligence feed alerting on repeated failed logins, rapid geolocation jumps (impossible travel), and datacenter IP access.

### Section 17: Omnichannel Notification History
- **Component:** Complete log of notifications delivered to the user across in-app banners, email, and SMS, including read status and dispatch timestamps.

### Section 18: Immutable Audit Trail & Administrative History
- **Component:** Real-time stream of all administrative actions performed on this user account, sourced from `AdminAuditLog` and `user_activity_logs`. Records admin ID, action type, old state, new state, and IP.

---

## 3. Data Flow & State Management

```
User Action in UI (e.g. Set Restriction)
       │
       ▼
Restriction Impact Simulator validates policy & generates preview
       │
       ▼
Admin confirms -> POST /api/admin/users/[id]/restrictions
       │
       ▼
Server-side AuthGuard verifies ADMIN / SUPER_ADMIN role
       │
       ▼
userControlService.setFeatureRestriction() executes:
  1. Validates feature key against FEATURE_KEYS registry
  2. Creates or updates record in user_restrictions
  3. Writes immutable entry to AdminAuditLog
       │
       ▼
Response returned to UI -> Profile state re-fetches cleanly
```

---

## 4. Safe Support Mode (Staff Impersonation Preview)

The User 360° Console includes an isolated **Safe Support Mode** toggle:
- Allows support staff to preview the exact storefront and dashboard experience from the customer's perspective.
- **Safety Boundaries:**
  - Financial mutations, wallet deductions, and order placements are locked in read-only mode during support sessions.
  - An unmistakable high-contrast top warning banner reminds staff that Safe Support Mode is active.
  - All support mode navigation is logged with staff credentials.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
