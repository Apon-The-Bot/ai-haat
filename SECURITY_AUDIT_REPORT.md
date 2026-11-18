# AI Haat security audit

## Executive summary

The defensive review covered selected source paths in the Next.js App Router, NextAuth Google OAuth and JWT sessions, Prisma/MySQL, supplier stock ingestion, PipraPay callbacks, and admin email previews. Four code changes address concrete findings. The release is held because account-wide revocation does not invalidate existing NextAuth JWTs. Proxy redirect handling remains an open review item. This report is neither certification nor verification of the full ASVS catalog.

## Baseline and threat model

- Remote baseline: `6fa98510a045f7fcfdea196effc65bf2590a0d40` on `origin/main`, verified through Git. Review work is on `codex/security-hardening` in an isolated worktree.
- Shared inventory: [project map](docs/PROJECT_MAP.md) and [route map](docs/ROUTE_MAP.md). The original `codex/admin-platform` checkout was outside the patch.
- Priority assets: administrative sessions, customer identity data, wallet balances, orders, and digital inventory. Trust boundaries include browser-to-app, app-to-identity provider, authenticated admin-to-HTML preview, supplier-to-stock ingestion, and payment-provider-to-ledger.
- Priority controls: enforce account and ownership state at the server, bind stock to its supplier/product/variation, confirm financial persistence before displaying success, and isolate HTML from privileged browser pages.

## Findings

| ID | Severity | Evidence and remediation | Status |
| --- | --- | --- | --- |
| SEC-01 | High | NextAuth uses JWT sessions in `src/lib/auth.ts`. The account-wide revocation routine in `src/lib/user-control/user-control-service.ts` deletes Prisma `Session` rows. The JWT callback does not check a durable revocation timestamp or version. Account-wide revocation cannot be relied on to invalidate existing JWTs. | Confirmed by source review. Open. |
| SEC-02 | Medium | Six campaign/template pages under `src/app/admin/email-marketing` rendered editable or persisted HTML in the privileged page DOM. The create/edit APIs require admin MFA. The pages now use `EmailHtmlPreview` with an empty iframe sandbox, restrictive document CSP, and no referrer. External preview images are blocked. Outgoing email rendering was outside this patch. | Patch applied. |
| SEC-03 | Medium | `src/lib/auth-guard.ts` previously continued authorizing non-admin requests if their account-status lookup threw. It now returns a generic HTTP 503 when verification is unavailable. | Patch applied. Active and unavailable status fixtures passed. |
| SEC-04 | Medium | Supplier stock ingestion did not bind variations and reused batch references to their intended stock scope. `src/lib/commerce/suppliers.ts` now checks variation ownership and the supplier, product, and variation of the batch returned by the upsert. The webhook reports scoped errors without returning unexpected internal errors. | Patch applied. Real database concurrency not verified. |
| SEC-05 | Medium | `src/app/api/payment/callback/route.ts` could display top-up success without confirming that the ledger credit succeeded. It now uses the authoritative credit result for success, otherwise redirects to pending. | Patch applied. Live gateway flow not verified. |
| SEC-06 | Unrated | Proxy redirect handling was identified for follow-up review. Exposure and impact require confirmation. | Candidate. Not counted as a confirmed vulnerability. |

## Coverage and verification

| Domain | Reference and coverage | Status and gaps |
| --- | --- | --- |
| Identity and access | ASVS 5.0 authentication, session management, and authorization areas. Reviewed auth guard, account state and revoke-all behavior. | `node scripts/test-auth-boundaries.mjs` exited 0 after the account-status patch. Real Google sign-in, role matrix and JWT revocation regression not exercised. |
| Browser and UI | ASVS 5.0 frontend and output handling. Reviewed admin email HTML insertion paths and isolated six previews. | No complete browser, responsive, or extension-free console matrix. |
| API and data | ASVS 5.0 validation and authorization. Reviewed supplier stock assignment and verification errors. | No comprehensive route/permission matrix or real concurrent MySQL test. |
| Payments | ASVS 5.0 business logic. Reviewed callback display status and existing mocked webhook suite. | No real financial transaction, gateway sandbox, or reconciliation run. |
| Supply chain and environment | OWASP Top 10 2025 and NIST SSDF as review references. Existing repository gates cover secrets, dependency audit and auth checks. | Hosting configuration, full Git history scanning, third-party integrations, storage and incident readiness are outside the verified coverage. |

OWASP [ASVS 5.0.0](https://asvs.owasp.org/), [Top 10 2025](https://owasp.org/projects/Top-Ten), [API Security Top 10](https://api-security.owasp.org/) and [NIST SSDF](https://csrc.nist.gov/projects/ssdf) inform the review. This is sampled domain coverage. Requirement-level coverage, PCI DSS applicability and formal conformance were not assessed.

## Execution and release

Independent source review corroborated the four patches. Baseline `npm audit --audit-level=high` and `npm audit --omit=dev --audit-level=high` both exited 0 with zero advisories, and the baseline secret gate checked 891 paths with zero findings. The mocked auth, payment and notification regressions exited 0 following the auth-guard change. The supplier source suite passed 25 checks and five synthetic callback outcomes passed. The wallet currently shows no dedicated notice for pending credits.

The final application patch set passed `npm run build` on Next.js 15.5.29 with existing lint warnings and the fallback catalog against a loopback-only fixture. Authenticated runtime and live database paths remain unverified.

GPT-6.1 Sol supervised delegated discovery, identity/browser review and remediation, backend/financial review, and supply-chain/independent verification. The user approved the substitute for GPT-5.6 Luna. Per-agent token accounting was unavailable.

No schema migration or new dependency is required for the four patches. A durable JWT-revocation change should be designed with account-wide revocation, guard and JWT acceptance tests, and explicit handling for already-issued tokens. Review the earlier remote bootstrap incident documented in [the branch audit](BRANCH_AUDIT_AND_MERGE_REPORT.md). Whether the bootstrap ever executed remains unknown. Current checks do not establish historical incident exposure or a credential rotation outcome.

The audit work has not been promoted to `origin/main`. Release CI and deployment were not exercised for this patch set. The hosting provider's automatic deployment setting was not verified.
