# 08 — SESSION, DEVICE & SECURITY CONTROL

## 1. Architectural Scope

Securing customer accounts against credential stuffing, account takeover (ATO), and unauthorized device access is a vital operational requirement for AI Haat. The **Session, Device & Security Subsystem** provides administrators with full visibility into active customer authentication sessions, trusted hardware devices, and security alerts, coupled with instant kill-switch capabilities.

---

## 2. Technical Implementation & Data Sources

- **Frontend Interface:** `Tab 9 — Sessions & Security` (`/admin/users/[id]`)
- **API Endpoints:**
  - `GET /api/admin/users/[id]/sessions` — Lists active sessions and registered trusted devices.
  - `DELETE /api/admin/users/[id]/sessions` — Terminates all active sessions or a specific targeted session.
- **Database Backing Models:** `Session`, `RefreshToken`, `TrustedDevice`, `UserSecurity`, `LoginHistory`.

---

## 3. Session Revocation Mechanics

When an account is compromised or an administrator suspends a user, lingering JWT or session tokens must not be permitted to execute actions.

### 3.1 The Revocation Engine (`src/lib/user-control/user-control-service.ts`)
```typescript
export async function revokeAllUserSessions(userId: string) {
  const now = new Date();

  // 1. Invalidate active NextAuth session records
  await prisma.session.updateMany({
    where: { userId, expires: { gt: now } },
    data: { expires: now },
  });

  // 2. Invalidate active refresh tokens
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: now },
  });

  // 3. Clear security session hashes if present
  await prisma.userSecurity.updateMany({
    where: { userId },
    data: { currentSessionToken: null, updatedAt: now },
  });

  // 4. Log session revocation event
  await logUserActivity({
    userId,
    category: "SECURITY",
    eventType: "ALL_SESSIONS_REVOKED_BY_ADMIN",
    description: "Administrator terminated all active customer sessions",
  });
}
```

### 3.2 Instant Client Disconnection
The moment sessions are revoked:
- NextAuth session validation middleware fails on the user's next network request.
- The user is redirected to the `/auth/login` portal with an `invalid_session` notification.
- Any background fetch or poll attempts return `401 Unauthorized`.

---

## 4. Trusted Device & Hardware Management

Customers who enable "Remember this Device" register entries in the `TrustedDevice` model:
- **Device Metadata Displayed:** Device Label (e.g. `Chrome on Windows 11`, `Safari on iPhone 15`), Last Active Date, Expiration Date.
- **Administrative De-authorization:** Administrators can selectively revoke trusted status from any device, forcing MFA re-verification on subsequent logins from that hardware.

---

## 5. Security Actions & Recovery Workflows

From Tab 9, administrators have access to three high-privilege emergency security actions:
1. **Force Password Reset:** Invalidates the current password hash, generates a cryptographically secure single-use reset token, and dispatches an account recovery email to the verified address.
2. **Revoke All Active Sessions:** Emergency kill-switch for compromised accounts.
3. **MFA Reset / Emergency Disable:** Allows verified administrators to assist customers who have lost their 2FA authenticator app, with mandatory step-up admin re-authentication and compliance logging.
