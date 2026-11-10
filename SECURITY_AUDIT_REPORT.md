# AI Haat security audit

**SECURITY BLOCKED — CRITICAL ISSUES REMAIN**

Review date 2026-11-10. AI Haat uses Next.js 15 App Router, React, NextAuth Google OAuth, Prisma/MySQL, managed Hostinger Node.js, PipraPay, SMTP and filesystem uploads. The trust boundaries reviewed include the browser session, the privileged API, database role and MFA state, guest invoice access, server configuration and the repository/build environment.

## Coverage

- Node.js 22 and Git inventory enumerated tracked and nonignored untracked files. The local exact-value comparison read 764 files at its initial pass, up to 16 MB per file. The tracked pattern gate scanned 759 paths. Paths and categories were emitted without values.
- Targeted review covered OAuth callbacks, session refresh, admin guard, profile lookup, invoice authorization, catalog mutations, SMTP clients, diagnostic scripts, env import validation and credential-related Git paths.
- A pattern-based history query identified 17 matching commits in source, scripts and docs. History matches include examples and have not been fully classified. The known credential files and suspicious build commit remain in history.
- Dependency assessment used npm's live production audit. It reported zero known vulnerabilities in the checked lockfile.
- Rescan found zero exact matches for the compared local credential values in 771 workspace files. An isolated production build completed with 113 static pages and an intentionally unavailable database. Its 270 JavaScript, CSS and map assets contained zero exact matches for the compared local credentials.
- Ignored backups, older generated bundles, large binary assets, inaccessible branches and Hostinger live data were outside the confirmed scan. Manual route coverage is incomplete.

## Findings

| Severity | Evidence | Status |
| --- | --- | --- |
| Critical | Database URL/password and SMTP password in tracked diagnostics matched locally configured values | Removed from current scripts and the historical issues document. Credential rotation, access review and history disposition pending. |
| Critical | Earlier Git commit added an obfuscated executable PostCSS payload and suspicious init file | Current baseline removes those files or payloads. Prior build execution and secret exposure remain incident-response blockers. |
| High | Unauthenticated email-based lookup and account writes in `src/app/api/auth/me/route.ts` | Session required. Client no longer sends an email selector. |
| High | Email allowlists auto-granted admin in JWT refresh, auth profile and authorization paths | Removed identity-based grants. New accounts are USER. Existing database admins must be reviewed for legacy promotions. |
| High | MFA status lookup errors could be treated as MFA disabled in `src/lib/auth-guard.ts` | Now returns 503. Product mutation aliases require admin MFA. |
| High | Disabled SMTP certificate validation in both delivery and marketing providers | Re-enabled validation and required TLS for nonimplicit-TLS transport. Live mailbox verification pending. |
| High | Guest invoice endpoint accepts a customer email and order identifier as proof of ownership | Open. Guest tracking currently depends on it. Replace with delivery of a signed, expiring access link or equivalent verified challenge before release. |
| High | Some privileged endpoints use the admin role without an MFA check | Catalog aliases fixed. Remaining role-only endpoints need a risk-based review and compatible step-up policy. |

No Hostinger configuration or live customer data changed.
