# 11 — DATABASE SCHEMA & API ROUTE SPECIFICATIONS

## 1. Database Architecture & Additions

To support the User 360° Management & Control System without disrupting existing live production tables, 5 new dedicated tables were created using idempotent SQL and reflected in `prisma/schema.prisma`.

### 1.1 New Database Models

#### 1. `UserRestriction` (`user_restrictions`)
Stores granular feature-level access restrictions for individual users.
- `id` (VARCHAR 191, PK)
- `userId` (VARCHAR 191, Indexed)
- `featureKey` (VARCHAR 100)
- `isBlocked` (BOOLEAN, default true)
- `restrictedActions` (JSON, optional action strings)
- `spendingLimitBDT` (DECIMAL 12,2, optional)
- `dailyLimitCount` (INT, optional)
- `reason` (TEXT)
- `appliedByAdminId` (VARCHAR 191)
- `appliedAt` (DATETIME, default now)
- `expiresAt` (DATETIME, optional auto-expiration)
- `isActive` (BOOLEAN, default true)
- *Unique Constraint:* `(userId, featureKey)`

#### 2. `UserStatusRecord` (`user_status_records`)
Maintains an immutable historical record of all account status transitions.
- `id` (VARCHAR 191, PK)
- `userId` (VARCHAR 191, Indexed)
- `status` (VARCHAR 50)
- `previousStatus` (VARCHAR 50)
- `reason` (TEXT)
- `internalNotes` (TEXT)
- `appliedByAdminId` (VARCHAR 191)
- `appliedAt` (DATETIME, default now)
- `expiresAt` (DATETIME, optional)
- `isActive` (BOOLEAN, default true)

#### 3. `UserAdminNote` (`user_admin_notes`)
Internal staff collaboration notes attached to customer accounts.
- `id` (VARCHAR 191, PK)
- `userId` (VARCHAR 191, Indexed)
- `authorAdminId` (VARCHAR 191)
- `note` (TEXT)
- `category` (VARCHAR 50, default "GENERAL")
- `createdAt` (DATETIME, default now)
- `updatedAt` (DATETIME, auto-update)

#### 4. `UserActivityLog` (`user_activity_logs`)
Chronological audit trail of customer interactions and operational events.
- `id` (VARCHAR 191, PK)
- `userId` (VARCHAR 191, Indexed)
- `category` (VARCHAR 50)
- `eventType` (VARCHAR 100)
- `description` (TEXT)
- `metadata` (JSON)
- `ipAddress` (VARCHAR 100)
- `userAgent` (TEXT)
- `createdAt` (DATETIME, default now)

#### 5. `UserTag` (`user_tags`)
Segmentation tags for customer categorization.
- `id` (VARCHAR 191, PK)
- `userId` (VARCHAR 191, Indexed)
- `tag` (VARCHAR 50)
- `assignedByAdminId` (VARCHAR 191)
- `createdAt` (DATETIME, default now)
- *Unique Constraint:* `(userId, tag)`

---

## 2. Admin API Endpoint Inventory

| Method | Endpoint Path | Role Required | Request Body / Query | Operational Function |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | `SUPER_ADMIN`, `ADMIN` | `page`, `limit`, `search`, `segment`, `status`, `role`, `sortBy`, `sortOrder` | Returns paginated user listing with KPI summary counts. |
| `POST` | `/api/admin/users` | `SUPER_ADMIN`, `ADMIN` | `{ name, email, phone, role, password, isVerified, notes }` | Creates a new user record through admin onboarding. |
| `POST` | `/api/admin/users/bulk` | `SUPER_ADMIN`, `ADMIN` | `{ action, userIds, reason, data }` | Executes bulk operations (`suspend`, `restore`, `restrict`, `tag`, `export`). |
| `GET` | `/api/admin/users/[id]` | `SUPER_ADMIN`, `ADMIN` | URL parameter `id` | Returns complete User 360° payload across all 11 tabs with masked secrets. |
| `PATCH`| `/api/admin/users/[id]` | `SUPER_ADMIN`, `ADMIN` | `{ name, email, phone, image }` | Updates customer profile details with duplicate detection and audit logging. |
| `DELETE`| `/api/admin/users/[id]`| `SUPER_ADMIN`, `ADMIN` | `{ reason }` | Soft-deactivates user account and revokes active sessions. |
| `POST` | `/api/admin/users/[id]/status` | `SUPER_ADMIN`, `ADMIN` | `{ status, reason, durationHours, expiresAt, notifyUser, internalNotes }` | Updates account lifecycle status (`ACTIVE`, `SUSPENDED`, `BANNED`, etc.). |
| `GET` | `/api/admin/users/[id]/restrictions` | `SUPER_ADMIN`, `ADMIN` | None | Returns active and historical feature restrictions for the user. |
| `POST` | `/api/admin/users/[id]/restrictions` | `SUPER_ADMIN`, `ADMIN` | `{ featureKey, isBlocked, restrictedActions, spendingLimitBDT, dailyLimitCount, reason, expiresAt }` | Sets or updates a granular feature restriction. |
| `DELETE`| `/api/admin/users/[id]/restrictions` | `SUPER_ADMIN`, `ADMIN` | Query param `featureKey`, `{ reason }` | Deactivates a feature restriction, restoring user entitlement. |
| `POST` | `/api/admin/users/[id]/wallet` | `SUPER_ADMIN`, `ADMIN` | `{ amountBDT, type, category, reason, referenceId, internalNotes }` | Executes atomic wallet balance credit or debit with ledger entry. |
| `GET` | `/api/admin/users/[id]/sessions` | `SUPER_ADMIN`, `ADMIN` | None | Lists active authentication sessions and registered trusted devices. |
| `DELETE`| `/api/admin/users/[id]/sessions` | `SUPER_ADMIN`, `ADMIN` | Query param `sessionId` (optional) | Revokes a targeted session or all active user sessions. |
| `GET` | `/api/admin/users/[id]/notes` | `SUPER_ADMIN`, `ADMIN` | None | Returns all internal administrative notes for the user. |
| `POST` | `/api/admin/users/[id]/notes` | `SUPER_ADMIN`, `ADMIN` | `{ note, category }` | Records a new internal staff note. |
| `GET` | `/api/admin/users/[id]/tags` | `SUPER_ADMIN`, `ADMIN` | None | Retrieves user classification tags. |
| `PUT` | `/api/admin/users/[id]/tags` | `SUPER_ADMIN`, `ADMIN` | `{ tags: string[] }` | Overwrites assigned customer segmentation tags. |
| `POST` | `/api/admin/users/[id]/reveal-credential` | `SUPER_ADMIN`, `ADMIN` | `{ keyId, reason }` | Decrypts and returns plaintext credential, logging `CREDENTIAL_REVEALED_BY_ADMIN`. |
