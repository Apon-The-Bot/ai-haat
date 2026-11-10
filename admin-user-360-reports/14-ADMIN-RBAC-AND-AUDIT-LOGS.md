# AI HAAT — ADMIN RBAC & IMMUTABLE AUDIT LOG SPECIFICATION
**Document ID:** REPORT-14  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Administrative Role-Based Access Control (RBAC), anti-escalation safeguards, and the immutable append-only `AdminAuditLog` architecture.

---

## 1. Executive Summary

Enterprise governance requires strict separation of duty, principle of least privilege, and non-repudiable audit logging. The AI Haat Admin Platform enforces a multi-tier RBAC model with hardware/server-level boundaries, robust anti-escalation safeguards, and an append-only audit log capturing every administrative mutation.

---

## 2. Administrative Role Hierarchy & Permissions Matrix

| Capability / Resource | `SUPER_ADMIN` | `ADMIN` | `SUPPORT` | `ANALYST` |
| :--- | :---: | :---: | :---: | :---: |
| **View User 360° Profiles** | Yes | Yes | Yes (Masked) | Yes (Masked) |
| **Edit Basic User Profile** | Yes | Yes | No | No |
| **Change User Lifecycle Status (Ban/Suspend)** | Yes | Yes | No | No |
| **Apply / Remove Feature Restrictions** | Yes | Yes | No | No |
| **Adjust Wallet Balance (Credit/Debit)** | Yes | Yes | No | No |
| **Revoke Active Sessions** | Yes | Yes | Yes | No |
| **Reveal Digital License Credentials** | Yes (Audited) | Yes (Audited) | No (Masked) | No (Masked) |
| **View Unmasked IP Addresses** | Yes | Yes | No (Masked) | No (Masked) |
| **Add / Delete Internal Staff Notes** | Yes | Yes | Yes (Add Only) | No |
| **Assign / Remove Customer Tags** | Yes | Yes | Yes | No |
| **Promote User to Admin / Change Roles** | Yes | No (Blocked) | No (Blocked) | No (Blocked) |
| **Modify System Automation Rules** | Yes | No | No | No |
| **Export User Data / Bulk CSV Operations** | Yes | Yes | No | No |

---

## 3. Anti-Privilege Escalation Safeguards

To prevent rogue administrators or compromised staff accounts from taking over the platform, the API layer enforces strict anti-escalation checks:

### 3.1 Role Modification Guard
Only a `SUPER_ADMIN` can change a user's role to `ADMIN` or `SUPER_ADMIN`. Any attempt by an `ADMIN` to promote themselves or another user is rejected with HTTP 403 (`Forbidden: Insufficient privileges to grant administrative roles`).

### 3.2 Self-Sanctioning Prevention
An administrator cannot ban, suspend, or revoke permissions from their own active account. This prevents accidental admin lockouts and self-inflicted denial of service.

### 3.3 Role-Based Data Redaction
As detailed in Report 08, staff accounts with `SUPPORT` or `ANALYST` tiers receive automatically redacted payloads from the API:
- IP addresses are masked (`103.145.***.***`).
- License keys and account credentials are permanently masked with no unmask button.

---

## 4. The Immutable `AdminAuditLog` Architecture

All administrative state modifications are written to `AdminAuditLog`:

```sql
CREATE TABLE `AdminAuditLog` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `adminId` VARCHAR(191) NOT NULL,
  `adminEmail` VARCHAR(191) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(100) NOT NULL,
  `resourceId` VARCHAR(191) NOT NULL,
  `details` JSON NOT NULL,
  `ipAddress` VARCHAR(100) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_admin_audit_resource` (`resource`, `resourceId`),
  INDEX `idx_admin_audit_adminId` (`adminId`),
  INDEX `idx_admin_audit_action_created` (`action`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.1 Logged Administrative Actions

| Action Key | Trigger / Event | Recorded Metadata |
| :--- | :--- | :--- |
| `USER_STATUS_CHANGE` | Account status changed (Active/Suspend/Ban). | `{ previousStatus, newStatus, reason, expiresAt }` |
| `FEATURE_RESTRICTION_SET` | Feature restriction applied or modified. | `{ featureKey, restrictionType, limitValue, reason }` |
| `FEATURE_RESTRICTION_REMOVED`| Feature restriction deleted. | `{ featureKey, reason }` |
| `ADMIN_WALLET_ADJUSTMENT` | Balance credit or debit executed. | `{ action, amount, previousBalance, newBalance, reason }` |
| `CREDENTIAL_REVEALED_BY_ADMIN`| License key or secret credential unmasked. | `{ deliveryItemId, customerUserId, justificationReason }` |
| `USER_PROFILE_UPDATE` | Admin modified user email, name, or phone. | `{ fieldsModified, reason }` |
| `USER_SESSIONS_REVOKED` | Admin terminated customer sessions. | `{ targetSessionId: "ALL" | token, reason }` |
| `INTERNAL_NOTE_ADDED` | Staff note posted to customer profile. | `{ noteId, category, isPinned }` |
| `CUSTOMER_TAGS_UPDATED` | Customer tags added or removed. | `{ tags: string[] }` |

### 4.2 Immutability Guarantees:
- **No DELETE / UPDATE Operations:** The Prisma data layer exposes no deletion methods for `AdminAuditLog`.
- **Search & Forensics:** Logs can be queried by `resourceId` (showing full history for one user), `adminId` (showing actions by one staff member), or `action` (identifying all credential reveals across the platform).

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
