# AI HAAT — SESSIONS & ACTIVITY TRACKING SPECIFICATION
**Document ID:** REPORT-09  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Session lifecycle management, force sign-out controls, structured event tracking across 6 categories, and audit immutability.

---

## 1. Executive Summary

The Sessions and Activity Tracking engine provides end-to-end visibility into user engagement, concurrent sessions, and behavioral patterns. It allows administrators to inspect active login sessions, immediately terminate compromised sessions, and query an immutable audit trail categorized into six standardized event domains.

---

## 2. Session Architecture & Revocation

AI Haat utilizes NextAuth with database-backed session models (`Session`, `Account`, `user_device_instances`). Every active session stores the session token, IP address, user-agent string, device instance ID, and expiration date.

### 2.1 Administrative Force Sign-Out
From `/admin/users/[id]`, administrators can view all active sessions and execute:
1. **Single Session Termination (`DELETE /api/admin/users/[id]/sessions?token=...`):** Invalidate an individual device session while leaving other authorized devices active.
2. **Global Force Sign-Out (`POST /api/admin/users/[id]/sessions` with `action: "REVOKE_ALL"`):**
   - Invokes `revokeAllUserSessions(userId)`.
   - Deletes all database session records for the user.
   - Clears active tokens from cache.
   - Automatically writes an event to `user_activity_logs` (`EVENT_ALL_SESSIONS_REVOKED`).
   - Forces the customer to re-authenticate on all devices.

---

## 3. The 6 Standardized Activity Event Categories

All user and administrative actions are logged in the `user_activity_logs` table under six distinct category taxonomies:

```
                          ┌───────────────────────────┐
                          │   user_activity_logs      │
                          └─────────────┬─────────────┘
                                        │
     ┌──────────────┬──────────────┬────┴─────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼              ▼              ▼
1. AUTH        2. ACCOUNT     3. COMMERCE    4. FINANCIAL   5. SECURITY    6. ADMIN
- Login        - Name Change  - Cart Add     - Top-up       - Password Chg - Status Chg
- Logout       - Avatar Chg   - Order Placed - Payment      - 2FA Setup    - Restriction
- Failed Login - Email Verify - License Used - Refund       - Session Kill - Staff Note
```

### Category Details:
1. **`AUTHENTICATION`:** Tracks user entry and exit. Includes successful logins, social OAuth completions, explicit logouts, and failed credential attempts.
2. **`ACCOUNT`:** Captures identity mutations. Profile edits, avatar uploads, email change requests, and verification milestones.
3. **`COMMERCE`:** Records customer buying intent. Adding items to cart, initiating checkout, order completion, product review submissions, and digital file downloads.
4. **`FINANCIAL`:** Tracks digital monetary movements. Wallet top-ups via bKash/Nagad, in-store wallet balance deductions for order purchases, promotional balance credits, and refunds.
5. **`SECURITY`:** High-priority defensive events. Password resets, 2FA enforcements, suspicious login flags, and credential reveals.
6. **`ADMIN`:** Actions performed on the user by staff. Placing or removing feature restrictions, changing account status, adding internal staff notes, and modifying tags.

---

## 4. Activity Log Schema & Immutability

```sql
CREATE TABLE `user_activity_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `metadata` JSON NULL,
  `ipAddress` VARCHAR(100) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_user_act_userId` (`userId`),
  INDEX `idx_user_act_cat_created` (`category`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Immutability Guarantees:
- **Append-Only:** No `UPDATE` or `DELETE` endpoints exist for `user_activity_logs`. Records are append-only.
- **Structured Metadata:** Rich contextual data (order IDs, previous balances, failure counts) is stored in the JSON `metadata` column for advanced filtering and forensic analysis.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
