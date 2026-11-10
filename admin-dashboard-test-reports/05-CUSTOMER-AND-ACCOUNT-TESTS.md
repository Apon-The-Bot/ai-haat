# AI HAAT — CUSTOMER & ACCOUNT SYSTEM TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Customer Directory, Role Authorization, Account Bans, LTV Tracking & Support Desk  
**Audit Timestamp:** November 2026  
**Auditor:** Senior Full-Stack Engineer & Application Security Specialist  

---

## 1. CUSTOMER IDENTITY & ACCOUNT ARCHITECTURE

Customer accounts in AI Haat are anchored to the `User` model in MySQL, supporting both Google OAuth and standard credential authentication via NextAuth:
- **Role Hierarchy:**
  - `CUSTOMER`: Standard consumer; access restricted to storefront, `/dashboard`, `/dashboard/keys` (Digital Vault), and `/dashboard/wallet`.
  - `ADMIN`: Operational staff; access to `/admin` operational hubs (orders, fulfillment, inventory, support tickets). Cannot modify system settings, access audit logs, or adjust user balances.
  - `SUPERADMIN`: Executive administrator; full system authority, user role promotion, wallet adjustments, BI reports, site configuration, and mailer settings.
- **Security & PII Protection:**
  - Passwords hashed using standard cryptographic hash functions.
  - TOTP two-factor authentication secrets stored in `UserSecurity`.
  - Backup recovery codes stored as versioned `hmac-v1` hashes.
  - Banned users flagged with `isBanned: true`; active NextAuth sessions are invalidated immediately on subsequent requests.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

The customer, role, and support management features were verified against:
- **`scripts/verify-all-fixes.ts` (Group 6):** Passed (Admin email priority & role checks)
- **`scripts/test-admin-operations-suite.ts` (Tests 2 & 4):** Passed (Customer wallet credit & support ticketing)
- **`scripts/test-admin-analytics-bi-master-suite.ts` (Test 10):** Passed (Repeat customer count & retention rates)
- **`scripts/test-application-security-hardening-suite.ts`:** Passed (Identity mapping & session protection)

---

## 3. DETAILED TEST FINDINGS & VERIFICATIONS

### 3.1 Customer Directory (`/admin/users`)
- **Search & Pagination:** Supports instant searching by customer name, email address, or phone number.
- **Metric Badges:** Each customer row displays:
  - Account Creation Date
  - Current Role (`CUSTOMER`, `ADMIN`, `SUPERADMIN`)
  - Wallet Balance (`৳X.XX`)
  - Total Orders Count & Lifetime Spend (LTV)
  - Account Status (`ACTIVE` or `BANNED`)
- **Superadmin Guarding:** Only accounts with `SUPERADMIN` privileges or configured in `ADMIN_EMAILS` can access `/admin/users` or mutate user roles.

### 3.2 Role Promotion & Authorization Boundaries
In `src/app/api/admin/users/[id]/route.ts`:
- **Role Transition Checks:** An administrator cannot promote themselves or demote other superadmins unless their email is explicitly listed in `ADMIN_EMAILS`.
- **Audit Logging:** Every role alteration triggers an entry in `AdminAuditLog` recording the actor, target user ID, previous role, and new role.
- **Fail-Closed Session Revalidation:** When an account is demoted from `ADMIN` to `CUSTOMER`, the NextAuth session callback immediately revokes administrative tokens upon the user's next request.

### 3.3 Account Suspension (Ban / Unban Lifecycle)
- **Admin Action:** Administrator clicks **"Ban User"** on the user row.
- **Database Mutation:** Sets `User.isBanned = true` and records the ban timestamp.
- **Session Termination:** In `src/lib/auth.ts`, the `session` callback evaluates `user.isBanned`. If `true`, the session is rejected, redirecting the user to `/auth/banned` and preventing any cart checkout, wallet deposit, or key retrieval.
- **Unban Capability:** The administrator can click **"Unban User"** to restore account access cleanly without losing past orders or digital vault keys.

### 3.4 Support Desk & Ticketing (`/admin/support`, `/admin/support/[id]`)
In `src/app/admin/support/page.tsx` and `src/app/admin/support/[id]/page.tsx`:
- **Ticket Lifecycle:** Tickets transition through `OPEN` -> `PENDING` -> `RESOLVED` -> `CLOSED`.
- **Priority Categorization:** Tickets are flagged with `LOW`, `NORMAL`, `HIGH`, or `URGENT` priority badges.
- **Conversation Thread:** The administrative viewer presents an interactive chat interface:
  - Blue message bubbles for customer inquiries.
  - Green message bubbles for administrative staff replies.
  - Grey italic cards for internal staff notes (visible only to administrators, never sent to customers).
- **Automated Email Notification:** When a staff member replies to a support ticket, the system dispatches an automated email to the customer containing the response and a 1-click link to view the ticket.

### 3.5 Customer Cohort & Repeat Purchase Metrics
In `src/lib/analytics/business-intelligence.ts`:
- **Repeat Customer Identification:** A customer is classified as a **Repeat Customer** if they have placed 2 or more verified orders.
- **Repeat Rate Metric:** `(Repeat Customers / Total Unique Verified Customers) * 100`.
- Verified in `test-admin-analytics-bi-master-suite.ts` (Test 10) that customers placing multiple verified orders are accurately attributed to the repeat cohort without count inflation.

---

## 4. CUSTOMER SYSTEM VERIFICATION SCORECARD

| Feature Area | Verification Status | Verified Invariants |
|--------------|:-------------------:|---------------------|
| User Directory View | **PASS** | Paginated list, search by email/phone/name, accurate balance display |
| Role Promotion/Demotion | **PASS** | Restricted to Superadmin; logged to immutable audit trail |
| Account Ban & Lockout | **PASS** | Immediate session invalidation; blocks checkout and vault access |
| Support Desk Queue | **PASS** | Filter by status/priority; customer email and order link visible |
| Staff Ticket Replies | **PASS** | Conversation thread updates; dispatches email notification to buyer |
| Customer PII Security | **PASS** | Passwords hashed; recovery codes hashed; no plaintext secrets in logs |
| Repeat Cohort Analytics | **PASS** | Correctly identifies multi-purchase accounts; AOV and LTV accurate |
