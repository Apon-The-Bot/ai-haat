# 09 — ADMIN RBAC & IMMUTABLE AUDIT LOGGING

## 1. Governance & Threat Model

In an administrative control system capable of managing customer finances, passwords, digital licenses, and account restrictions, internal administrative access itself represents the greatest potential attack surface. Rogue administrators, compromised staff credentials, or accidental operational errors can cause catastrophic financial or reputational damage.

To mitigate this, AI Haat implements a **Dual-Layer Governance Architecture**:
1. **Granular Server-Side Administrative RBAC:** Segregates duties and blocks privilege escalation.
2. **Immutable Append-Only Audit Logging:** Records every administrative intervention permanently.

---

## 2. Granular Administrative Roles

| Role Key | Permissions Scope | Permitted User Control Operations |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Unrestricted platform authority. | All operations, including role assignment, emergency system freezes, and system configuration. |
| **`ADMIN` / `USER_MANAGER`** | Comprehensive customer operations. | User creation, profile updates, account suspensions, feature restrictions, session terminations, internal notes. |
| **`FINANCE_ADMIN`** | Financial and balance operations. | Wallet balance adjustments, refund settlements, dispute resolutions, financial ledger exports. |
| **`SUPPORT_ADMIN`** | Customer assistance. | Read-only profile view, order status review, ticket management, masked credential reveal (with reason). Cannot adjust wallets or ban users. |
| **`MODERATOR`** | Community and account safety. | Temporary account suspensions, spam restrictions. Cannot touch finances or digital stock. |
| **`ANALYST`** | Read-only intelligence. | Anonymized user analytics, activity reports, and aggregate metrics. Zero write permissions. |

---

## 3. Server-Side Privilege Escalation Prevention

To prevent lower-tier staff from granting themselves elevated privileges:
- Route handlers enforcing role updates verify that the acting administrator holds a higher or equal role to the target role.
- No administrator (except `SUPER_ADMIN`) can assign the `SUPER_ADMIN` role.
- Self-role modification is blocked at the API level (`actingAdminId !== targetUserId` for role changes).

---

## 4. Immutable Administrative Audit Logging

### 4.1 Schema & Data Integrity
Every administrative action persists to the `AdminAuditLog` model:

```sql
CREATE TABLE IF NOT EXISTS `AdminAuditLog` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `adminId` VARCHAR(191) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `targetUserId` VARCHAR(191) NULL,
  `resource` VARCHAR(100) NOT NULL,
  `details` JSON NULL,
  `reason` TEXT NULL,
  `ipAddress` VARCHAR(100) NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_admin_audit_target` (`targetUserId`, `createdAt`),
  INDEX `idx_admin_audit_action` (`action`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 Immutability Guarantees
1. **Append-Only Access:** The application contains zero API endpoints, SQL routines, or UI components allowing the modification (`UPDATE`) or deletion (`DELETE`) of audit log entries.
2. **Mandatory Audit Context:** All mutations in `UserControlService` mandate an `adminId` and `reason`. Attempting to invoke an administrative adjustment without an authenticated admin context throws a compile-time or runtime exception.
3. **Structured Context Payload:** The `details` field stores before-and-after snapshots (e.g. `{ previousBalance: 500, newBalance: 1200, adjustment: 700 }`).

---

## 5. Audited Action Catalog

Key events captured in the immutable audit log:
- `USER_CREATED_BY_ADMIN`
- `USER_PROFILE_UPDATED`
- `USER_STATUS_SUSPENDED`
- `USER_STATUS_BANNED`
- `USER_STATUS_RESTORED`
- `FEATURE_RESTRICTION_APPLIED`
- `FEATURE_RESTRICTION_REMOVED`
- `WALLET_MANUALLY_CREDITED`
- `WALLET_MANUALLY_DEBITED`
- `CREDENTIAL_REVEALED_BY_ADMIN`
- `ALL_SESSIONS_REVOKED`
- `ADMIN_NOTE_RECORDED`
- `CUSTOMER_TAGS_UPDATED`
- `BULK_USERS_SUSPENDED`
- `BULK_FEATURE_RESTRICTION`
- `USER_DATA_EXPORTED_CSV`
