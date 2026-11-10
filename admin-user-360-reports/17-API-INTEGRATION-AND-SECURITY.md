# AI HAAT — API INTEGRATION & PERIMETER SECURITY SPECIFICATION
**Document ID:** REPORT-17  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Complete catalog of REST API endpoints, input validation schemas, authentication guards, CSRF defenses, and formula injection sanitization.

---

## 1. Executive Summary

The AI Haat Enterprise Control Center exposes a hardened, role-protected REST API architecture governing user management, financial balance adjustments, security intelligence, and granular feature restrictions. Every endpoint enforces server-side authentication, role authorization, strict input validation, rate limiting, and immutable audit logging.

---

## 2. Admin API Endpoint Catalog

All routes are mounted under `/api/admin/users` and require `ADMIN` or `SUPER_ADMIN` authorization unless otherwise noted.

| HTTP Method | Route | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Filtered, sorted, paginated user list with KPI aggregates. | Staff (`ADMIN`, `SUPER_ADMIN`) |
| `POST` | `/api/admin/users` | Create customer or staff account with mandatory validation. | `ADMIN`, `SUPER_ADMIN` |
| `POST` | `/api/admin/users/bulk` | Bulk actions (ban, activate, tag, export sanitized CSV). | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/admin/users/[id]` | Composite 360° user payload (Profile, Orders, Wallet, Notes). | Staff (`ADMIN`, `SUPER_ADMIN`, `SUPPORT`) |
| `PATCH` | `/api/admin/users/[id]` | Update user name, phone, email, or role. | `ADMIN`, `SUPER_ADMIN` |
| `DELETE` | `/api/admin/users/[id]` | Soft-deactivate user account and terminate sessions. | `ADMIN`, `SUPER_ADMIN` |
| `POST` | `/api/admin/users/[id]/status` | Modify lifecycle status (`ACTIVE`, `SUSPENDED`, `BANNED`). | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/admin/users/[id]/restrictions` | List active feature restrictions for user. | Staff |
| `POST` | `/api/admin/users/[id]/restrictions` | Apply or update feature restriction. | `ADMIN`, `SUPER_ADMIN` |
| `DELETE` | `/api/admin/users/[id]/restrictions` | Remove feature restriction and restore capability. | `ADMIN`, `SUPER_ADMIN` |
| `POST` | `/api/admin/users/[id]/wallet` | Atomic credit or debit to customer wallet balance. | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/admin/users/[id]/sessions` | List active sessions, IP addresses, user agents. | Staff |
| `DELETE` | `/api/admin/users/[id]/sessions` | Invalidate single or all active user sessions. | `ADMIN`, `SUPER_ADMIN`, `SUPPORT` |
| `GET` | `/api/admin/users/[id]/notes` | List internal staff collaboration notes. | Staff |
| `POST` | `/api/admin/users/[id]/notes` | Add internal staff note (optionally pinned). | Staff |
| `GET` | `/api/admin/users/[id]/tags` | Get customer segmentation tags. | Staff |
| `PUT` | `/api/admin/users/[id]/tags` | Replace or update customer tags. | Staff |
| `POST` | `/api/admin/users/[id]/reveal-credential` | Request audited reveal of masked license key. | `ADMIN`, `SUPER_ADMIN` |
| `GET` | `/api/admin/users/[id]/intelligence` | Fetch client environment telemetry with role masking. | Staff (Masked for `SUPPORT`) |
| `POST` | `/api/admin/users/[id]/intelligence/observations` | Ingest client telemetry with GPS consent check. | Authenticated User |
| `POST` | `/api/admin/users/[id]/intelligence/consent` | Update consent preferences in Consent Ledger. | Authenticated User |

---

## 3. Perimeter Security Controls

### 3.1 Role & Session Guard (`src/lib/auth-guard.ts`)
Every admin endpoint invokes `requireAuth(req)` or `authGuard(req, ['ADMIN', 'SUPER_ADMIN'])`. Unauthenticated requests receive HTTP 401 (`Unauthorized`). Authenticated requests with non-admin roles receive HTTP 403 (`Forbidden`).

### 3.2 Anti-CSRF Defenses
- Next.js SameSite=Lax cookie policies prevent cross-origin state-changing attacks.
- Mutation endpoints (`POST`, `PATCH`, `DELETE`) validate `Origin` and `Host` request headers against trusted system origins.

### 3.3 CSV Formula Injection Defense
When exporting user data in `/api/admin/users/bulk`, malicious text fields (e.g. user names like `=cmd|' /C calc'!A0` or `@SUM(1,2)`) are sanitized before serialization:
```typescript
function sanitizeCsvValue(val: string): string {
  if (typeof val === 'string' && /^[=+\-@\t\r]/.test(val)) {
    // Prefix with single quote to prevent spreadsheet execution
    return `'${val}`;
  }
  return val;
}
```

### 3.4 Rate Limiting & Denial-of-Service Defense
Sensitive mutation endpoints (such as status updates, wallet adjustments, and credential reveals) are bounded by token-bucket rate limiters restricting abusive request bursts.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
