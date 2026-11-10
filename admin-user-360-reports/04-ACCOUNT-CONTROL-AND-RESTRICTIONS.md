# AI HAAT — ACCOUNT CONTROL & RESTRICTION SYSTEM
**Document ID:** REPORT-04  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Lifecycle state machine, suspension/ban enforcement, session invalidation, automated expiration, and perimeter security guards.

---

## 1. Executive Summary

The AI Haat Account Control and Restriction System governs customer lifecycle transitions, administrative sanctions, and automated fraud quarantines. Every account state change is strictly audited, requires mandatory operational justification, enforces instant session termination for adverse states, and is verified server-side on every incoming request.

---

## 2. Account Lifecycle State Machine

```
              ┌────────────────────────┐
              │  PENDING_VERIFICATION  │
              └───────────┬────────────┘
                          │ Email Verified / Admin Approval
                          ▼
                    ┌────────────┐
       ┌───────────►│   ACTIVE   │◄──────────────┐
       │            └─────┬──────┘               │
       │                  │                      │
       │ Admin Restore /  │ Admin Action /       │ Admin Reactivation
       │ Expiry Cleanup   │ Fraud Detection      │
       │                  ▼                      │
       │            ┌────────────┐               │
       ├────────────┤ SUSPENDED  │               │
       │            └─────┬──────┘               │
       │                  │ Escalation           │
       │                  ▼                      │
       │            ┌────────────┐               │
       ├────────────┤   BANNED   │               │
       │            └────────────┘               │
       │                                         │
       │            ┌────────────┐               │
       └────────────┤DEACTIVATED ├───────────────┘
                    └────────────┘
```

### 2.1 State Definitions & Behaviors

| State | Customer Access Level | Login Permitted | Storefront Browsing | Checkout / Purchases | API Response Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ACTIVE`** | Normal authenticated operations. | Yes | Yes | Yes (subject to feature quotas) | `200 OK` |
| **`SUSPENDED`** | Account quarantined temporarily. | Blocked | Read-only | Hard Blocked | `403 Forbidden` (`ACCOUNT_SUSPENDED`) |
| **`BANNED`** | Permanent administrative termination. | Blocked | Blocked / Redirected | Hard Blocked | `403 Forbidden` (`ACCOUNT_BANNED`) |
| **`PENDING_VERIFICATION`** | Awaiting email/SMS or KYC verification. | Limited | Read-only | Blocked until verified | `403 Forbidden` (`VERIFICATION_REQUIRED`) |
| **`DEACTIVATED`** | User requested self-closure. | Blocked | Read-only | Blocked | `403 Forbidden` (`ACCOUNT_DEACTIVATED`) |

---

## 3. Administrative Enforcement Rules

### 3.1 Mandatory Justification
No administrative status change can occur without an explicit `reason` string (minimum 5 characters). Submitting an empty or whitespace-only reason is rejected by the API with HTTP 400 (`Bad Request: Justification reason is required`).

### 3.2 Instant Session Invalidation
When an administrator transitions an account to `SUSPENDED` or `BANNED`:
1. `userControlService.setUserStatus()` updates the active status record in `user_status_records`.
2. The service calls `revokeAllUserSessions(userId)`.
3. All active NextAuth sessions, JWT credentials, and session tokens stored in the session store or cache are invalidated immediately.
4. Next incoming request from the user's browser fails authentication immediately.

### 3.3 Temporary Suspensions & Auto-Expiration
- Suspensions can be configured with an optional `expiresAt` timestamp (e.g. 7-day or 30-day cooling period).
- The automated background rule `RULE_RESTRICTION_EXPIRY_CLEANUP` runs periodically, querying for expired temporary status records and returning the user to `ACTIVE` status when the expiration threshold passes.

---

## 4. Server-Side Perimeter Defense (`src/lib/auth-guard.ts`)

Enforcement is never left to frontend presentation logic alone. The core `requireAuth()` helper executes an effective status check against the database:

```typescript
// Excerpt from src/lib/auth-guard.ts
const effectiveStatus = await getUserEffectiveStatus(session.user.id);

if (effectiveStatus.status === 'BANNED') {
  return NextResponse.json(
    { 
      error: 'Account Banned', 
      message: 'Your account has been permanently suspended due to terms violation.',
      reason: effectiveStatus.reason 
    },
    { status: 403 }
  );
}

if (effectiveStatus.status === 'SUSPENDED') {
  return NextResponse.json(
    { 
      error: 'Account Suspended', 
      message: 'Your account is temporarily suspended.',
      expiresAt: effectiveStatus.expiresAt,
      reason: effectiveStatus.reason 
    },
    { status: 403 }
  );
}
```

Any attempt to call authenticated API endpoints (`/api/orders`, `/api/wallet/purchase`, `/api/tickets`, etc.) fails at the perimeter before any business logic executes.

---

## 5. Audit & Compliance Recording

Every status mutation writes two persistent records:
1. An entry in `user_status_records` linking `userId`, `status`, `reason`, `adminId`, `adminEmail`, and `expiresAt`.
2. An immutable event in `AdminAuditLog` recording:
   - `action`: `USER_STATUS_CHANGE`
   - `resource`: `User`
   - `resourceId`: `userId`
   - `details`: JSON payload with `{ previousStatus, newStatus, reason, expiresAt }`
   - `adminId` & `ipAddress`.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
