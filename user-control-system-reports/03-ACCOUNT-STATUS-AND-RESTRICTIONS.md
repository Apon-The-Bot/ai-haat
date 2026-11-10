# 03 — ACCOUNT STATUS & RESTRICTIONS MANAGEMENT

## 1. Overview & Architecture

The **Account Status & Restrictions Subsystem** is responsible for orchestrating the lifecycle of customer accounts on AI Haat (`aihaat.shop`). In high-volume digital commerce, basic boolean flags (`isBanned: boolean`) are inadequate. This implementation enforces a deterministic state machine, time-bounded automatic expiration, multi-layered status evaluation, and strict server-side blocking at the authentication guard level.

---

## 2. Supported Lifecycle States

The system defines 6 formal states:

| Status Code | System Behavior | Login Permitted | API Access | Session Handling |
| :--- | :--- | :--- | :--- | :--- |
| `ACTIVE` | Normal operating status. Full access according to role. | Yes | Yes | Retained |
| `SUSPENDED` | Temporary freeze pending dispute resolution or fraud review. | Blocked | Blocked (403) | Invalidated immediately |
| `BANNED` | Permanent termination due to malicious behavior or policy breach. | Blocked | Blocked (403) | Invalidated permanently |
| `RESTRICTED` | Targeted capability freeze (e.g. checkout or wallet disabled). | Allowed | Partially Blocked | Retained |
| `PENDING_VERIFICATION` | New account awaiting email or phone OTP verification. | Allowed | Limited | Retained |
| `DEACTIVATED` | Soft-deleted or customer-requested dormancy. | Blocked | Blocked (403) | Invalidated |

---

## 3. Effective Status Evaluation Algorithm

A common flaw in user management systems is "state collision" (e.g. a user flagged both as `SUSPENDED` and `ACTIVE` across different tables). AI Haat solves this via `getUserEffectiveStatus(userId)` in `src/lib/user-control/user-control-service.ts`.

### 3.1 Evaluation Workflow
```mermaid
flowchart TD
    A[Incoming Request for User Status] --> B{Fetch Active Record from user_status_records}
    B -- Record Found --> C{Is Status SUSPENDED & Has expiresAt?}
    C -- Yes --> D{Is expiresAt <= now()?}
    D -- Expired --> E[Auto-Restore to ACTIVE<br/>Mark Record Inactive<br/>Log Auto-Restoration]
    D -- Active --> F[Return Effective Status: SUSPENDED]
    C -- No / Permanent --> G[Return Recorded Status: BANNED / SUSPENDED]
    B -- No Record Found --> H{Check Fallback User Table Status}
    H --> I[Return Effective Status: ACTIVE or Default]
```

### 3.2 Auto-Restoration on Expiry
When an administrator suspends a user for a specific duration (e.g. 24 hours, 7 days):
1. An `expiresAt` timestamp is recorded in `user_status_records`.
2. When the user attempts an action after that timestamp, `getUserEffectiveStatus()` detects the elapsed time.
3. The system atomically deactivates the suspension record, restores the user's effective status to `ACTIVE`, and logs an automated restoration event.
4. The user resumes platform access without requiring manual administrative intervention.

---

## 4. Server-Side Enforcement Layer

Restricting an account in the database is meaningless if API routes do not enforce it. AI Haat embeds status checks directly into the primary authentication perimeter:

### 4.1 Authentication Guard (`src/lib/auth-guard.ts`)
Every authenticated API request passes through `requireAuth()`:
```typescript
const effectiveStatus = await getUserEffectiveStatus(user.id);

if (effectiveStatus.status === "BANNED") {
  return NextResponse.json(
    { 
      error: "ACCOUNT_BANNED", 
      message: "Your account has been permanently suspended. Please contact support.",
      reason: effectiveStatus.reason 
    },
    { status: 403 }
  );
}

if (effectiveStatus.status === "SUSPENDED") {
  return NextResponse.json(
    { 
      error: "ACCOUNT_SUSPENDED", 
      message: "Your account is temporarily suspended.",
      reason: effectiveStatus.reason,
      expiresAt: effectiveStatus.expiresAt 
    },
    { status: 403 }
  );
}
```

### 4.2 Immediate Session Invalidation
When an administrator executes a `SUSPEND` or `BAN` action:
1. `UserControlService.setUserStatus()` updates the active status record.
2. The service immediately dispatches `revokeAllUserSessions(userId)`:
   - Sets `expiresAt = now()` on active sessions in the `Session` table.
   - Revokes active refresh tokens in `RefreshToken`.
   - Clears active tokens in `UserSecurity`.
3. The user's active browser session is instantly decoupled on their next server ping.

---

## 5. Database Schema & Persistence

The subsystem is backed by the `user_status_records` table:

```sql
CREATE TABLE IF NOT EXISTS `user_status_records` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `previousStatus` VARCHAR(50) NULL,
  `reason` TEXT NOT NULL,
  `internalNotes` TEXT NULL,
  `appliedByAdminId` VARCHAR(191) NOT NULL,
  `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX `idx_user_status_lookup` (`userId`, `isActive`),
  INDEX `idx_status_expiry` (`status`, `expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. Audit & Traceability

Every status mutation enforces:
1. **Mandatory Administrative Justification:** Status changes cannot be submitted without a descriptive reason.
2. **Administrator Identification:** The authenticated admin ID (`appliedByAdminId`) is permanently tied to the record.
3. **Dual Audit Logging:** Generates records in both `AdminAuditLog` (for platform compliance) and `UserActivityLog` (for user-specific history).
