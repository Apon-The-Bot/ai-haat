# WhatsApp Automation implementation tracker

Hostinger reauthorization follow-up: read-only calls verified active Business v5, Next.js on Node 22 and an empty cron list. The prior token-expiration blocker is resolved. Runtime path and real acceptance gates remain open; see the updated release report.

Latest release gate: **NO-GO**. The bounded cron implementation supersedes the persistent dispatch descriptions below. See [release evidence and operator instructions](RELEASE_READINESS.md). One new additive migration, 20261120000700_whatsapp_release_controls, follows the seven previously pending migrations. No production or QA migration has been applied. Local verification now includes 11 passing fixture tests, a production build and two Firefox viewport checks. Hostinger MCP authentication expired. Live MySQL, pairing, delivery and host scheduling measurements remain open.

Production rollout attempt: **stopped at backup gate**. The existing encrypted backup is 2026-11-10. A new remote logical backup did not complete and was interrupted. No production migration, environment update, cron registration or deploy was performed.

User-provided Hostinger screenshot dated 2026-11-20 00:09 shows both database and files backups as Completed and prepared for download. Treat this as an external restore-point observation. The downloaded database artifact, checksum and restore drill remain unverified in the workspace.

The read-only production gate verified target `srv1497.hstgr.io/u298980084_ai_haat`, found nine pending migrations and confirmed the migration SQL has no DROP, TRUNCATE or DELETE statements. Read-only HTTP smoke passed for `/`, `/api/health` and `/login`; health reported database UP. The newest local backup remains outside the 24-hour gate.

The project runs Next.js 15 App Router, NextAuth and Prisma/MySQL. Local Node is 22.20.0. The existing WhatsApp helper generates support links. Five existing cron routes demonstrate periodic HTTP handlers, and the shared cron guard validates a bearer secret.

The repository includes a PM2 cluster configuration. Each worker has separate memory, so account ownership and send claims require database coordination. The deployment runbook describes a VPS but does not verify the active hosting plan, outbound WebSocket lifetime, worker recycling or an installed cron schedule.

The npm legacy tag and [official releases](https://github.com/WhiskeySockets/Baileys/releases) identify 6.7.24 as the non-RC candidate. The latest tag is 7.0.0-rc14. [Baileys documentation](https://baileys.wiki/) describes Node WebSocket transport and QR/pairing authentication.

| Phase | Status |
|---|---|
| Architecture and hosting | Preliminary repository inspection complete. Live hosting capabilities unverified. |
| Database and security | Three additive migrations cover accounts, encrypted records, consent, jobs and recurrence. Local port 3306 had no listener and no MySQL service or CLI was found. Migrations unapplied. Admin handlers require existing admin MFA. Mutations check request origin. |
| Account connection | Baileys socket creation, encrypted QR and Signal key persistence, lease renewal and fenced writes implemented. Cron can acquire expired leases. Live pairing, worker failover, logout and removal acceptance pending. |
| Messaging | Text queue, contact registration, consent, number normalization, group lookup and membership checks implemented. Ambiguous submissions remain Unknown. Media, receipt reconciliation, audit trail and configurable limits pending. |
| Scheduling | UTC jobs, Dhaka input, immediate and one-time scheduling, daily/weekly/monthly/custom-day recurrence, pause/resume/cancel implemented. Expired intervening intervals are skipped after successful submission. Retry policy, editing and duplication pending. |
| Dashboard | Accounts, pairing, contact consent, text composer, scheduling and recent history wired to admin APIs. Templates, analytics, settings, pagination and responsive QA pending. |
| QA | Prisma generation/validation, TypeScript, five recipient/calendar assertions passed. Lint passed with warnings. Production build passed before recurrence changes. Architecture checker reports 104 oversized files. Database integration, concurrent workers, live hosting and end-to-end behavior unverified. |
| Deployment readiness | Incomplete |

## QA configuration

Use an isolated MySQL target with the project schema and migration history initialized. Review pending migrations before applying to QA. Set WHATSAPP_ENABLED=true to enable account management. WHATSAPP_SESSION_KEY must be a private 64-character random hex string shared by all workers. Back it up securely. Changing it makes saved sessions unreadable. WHATSAPP_SENDING_ENABLED=true enables queue submission and dispatch. Environment switch changes require restarting all workers.

The existing scheduler must POST /api/cron/whatsapp with the Authorization bearer CRON_SECRET header, e.g. every minute for session recovery. While connected, each account checks one due job per heartbeat. Record a host-side observation of outgoing WebSocket survival, worker restart and cron invocation before enabling scheduling for production. Use an explicitly authorized test recipient and account. No new hosted infrastructure is configured.

The installed Baileys 6.7.24 includes the v6 fix identified in [GHSA-qvv5-jq5g-4cgg](https://github.com/WhiskeySockets/Baileys/security/advisories/GHSA-qvv5-jq5g-4cgg).

## November 20 continuation (supersedes earlier checkpoints)

The account owner handles disconnect and logout requests at heartbeat time. Local removal requires a released lease, no stored credentials and no message history. The phone pairing control requests a Baileys code and keeps it in the encrypted record store for display. Group sync imports participating group IDs and names with consent off for new groups. Socket operations, remote logout, group import and restart still require integration testing.

The composer supports a confirmed submission, saved account-specific text templates and one attachment per message (2 MiB). Supported formats are JPEG, PNG, selected MP4 containers, Ogg audio and PDF. The server checks encoded and decoded sizes and signatures, normalizes filenames and stores bytes privately in MySQL. Signatures do not provide malware detection. Recurrences reference the same stored attachment. Long-term media retention and storage quotas are pending.

Direct-chat acknowledgements match account, destination and an outgoing message ID saved before submission. Read and delivered transitions are monotonic. Group receipt aggregation is pending. History supports recipient/text/status/date filters and CSV for the 100 most recent scheduled timestamps. Analytics counts cover the entire selected account. Schedule editing changes text and timestamp. Duplication creates a paused copy.

Account and message mutations use the existing per-worker rate limiter and admin audit logger. Audit metadata contains action and account ID. Recipient lookup retries back off before submission and stop after four attempts. Unknown outcomes never re-enter that path. Scheduling supports selected weekdays and four fixed-offset zones (Dhaka, UTC, Kolkata and Singapore). Global cluster-wide quotas, a settings interface, retention policies and group receipt aggregation remain open.

### Changed files and schema

- Accounts and messaging APIs under src/app/api/admin/whatsapp, plus src/lib/whatsapp/connect.ts, dispatch.ts and media.ts.
- Composer, account controls, history and CSV under src/app/admin/whatsapp.
- prisma/schema.prisma and migrations 20261120000300_whatsapp_templates_receipts, 20261120000400_whatsapp_media, 20261120000500_whatsapp_preflight_retry and 20261120000600_whatsapp_zones. All seven WhatsApp migrations remain unapplied.
- scripts/test-whatsapp-dispatch.cjs exercises production dispatch code with a mocked DB and socket. scripts/test-whatsapp-responsive.cjs renders the actual components with fixture responses.

### Verification and release gates

TypeScript, Prisma validation, production build and lint completed (lint warnings). The final build generated 135 static pages; product prerendering logged an unavailable isolated local DB. Seven automated tests passed, covering mocked concurrent dispatch, ambiguous submission, opted-out recipient, media rejection, session isolation and calendar boundaries. Firefox rendered the dashboard components against fixture API responses at 360px and 1280px, verified no horizontal overflow and disabled sending without a recipient. The repository architecture check still lists 104 oversized files. The mock queue does not exercise InnoDB locking.

No local MySQL service or QA connection was identified. The automatic execution policy rejected the command to download, initialize and launch a temporary MySQL server. No migration, database concurrency test or real WhatsApp submission ran. Production remains unapproved. Require an isolated QA database, a test account and consented recipient, and runtime observation on the actual hosting plan.

[Hostinger managed Node limits](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/) document one app process, shared resources, a 120-second request timeout and no always-running worker support on managed web/cloud plans. This does not establish which plan runs AI Haat. The PM2 config alone cannot verify outbound socket lifetime, cron interval, sleep/recycle behavior, DB connection limits or recovery across deployment.
