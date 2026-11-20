# WhatsApp integration checkpoint

Specification: `AI_Haat_WhatsApp_Automation_12_Feature_Master_Goal.txt`. Starting HEAD `bbf69ad`. Existing dirty work preserved. See [baseline](00_BASELINE_AUDIT.md).

WA-01 adds `src/lib/whatsapp/automation-events.ts` and its unit test. Strict envelopes accept internal identifiers only, map event types to expected producer and template keys, and derive a deterministic key from schema, type, entity and version. Producer labels validate shape and never confer authority. Disposition is dry-run. No route callers, persistence, credentials, network or send activation in this slice.

Checks: `node --test scripts/test-whatsapp-automation-events.cjs scripts/test-whatsapp-dispatch.cjs` passed 13 tests. Rollback removes the two WA-01 files and this documentation. No migrations.

Resume with category-specific consent and suppression contracts, then additive isolated outbox work and authoritative domain adapters. Preserve legacy queue interfaces. Live provider and isolated database acceptance remain open.

WA-02 adds `src/lib/whatsapp/automation-consent.ts`, a pure eligibility check for current verified identity ownership, number revision, explicit purpose consent, and revocation or suppression. The legacy account contact boolean is not an input. Promotional suppression leaves independently consented support eligible at this layer. Provider category approval remains a separate gate. No storage or caller is wired yet. Combined suite passed 14 tests and typecheck passed. Rollback removes this module and the WA-02 test additions. Next design additive outbox and durable consent evidence persistence, then exercise isolated DB claims and authoritative lifecycle producers.

WA-03 adds the event table, migration and transaction-scoped recorder. Prisma validate/generate, typecheck and 15 local fixtures passed. The mock confirms validated writes and stable duplicate IDs. The table has no producer or consumer wired and no automatic send entry point. See [migration details](04_DATA_MIGRATIONS.md). Next add bounded processing state and durable consent evidence, then validate atomic writes on isolated MySQL.

WA-04 adds a 20-event dry-run inspector with token-guarded claims and 30-second recovery. Inspected is envelope validation only. It does not mean eligible, queued, or delivered. No scheduler caller, provider or send path wired. Prisma validation, generation and typecheck passed. Continue with durable consent and isolated MySQL verification.

WA-05 adds durable identity, explicit purpose consent and scoped suppression models and a bounded eligibility reader. Verified address fingerprints are required and must be produced by a future trusted keyed verification flow. Existing User.phone has no verified status and is not imported. Prisma validation/generation, typecheck and 17 fixture tests passed. No migration applied. Next implement trusted grant/revoke flows, and build authoritative lifecycle adapters with isolated migration tests.

WA-05 follow-up adds a transaction-scoped, ownership-bound and idempotent consent revocation helper plus strict canonical E.164 HMAC fingerprinting. The WhatsApp fixture suite passes (8 tests, 18 assertions). Repository-wide typecheck remains blocked by pre-existing/in-scope unrelated `scratch/animateicons-upstream` missing dependencies and `Tooltip.tsx`/`tooltip.tsx` casing conflicts. No production database, migration or live provider was used. Trusted enrollment/grant wiring and authoritative lifecycle adapters remain open.

WA-05 trusted grant follow-up adds a transaction-scoped grant helper that requires the current verified identity and matching fingerprint, validates purpose/evidence, and safely reactivates a revoked purpose through upsert. Fixture coverage now includes grant and re-grant rejection cases. No route or production caller is wired yet.

WA-06 and WA-07 parallel dry-run slice adds marketing campaign and back-in-stock event types with pure authoritative adapters. Marketing requires approval, a ready template and eligible recipients; stock requires available inventory and opted-in recipients. Both return validated events only and do not send or wire domain callers. Fixture suite now covers both gates.

WA-08 and WA-09 parallel dry-run slice adds review-request and customer-reactivation event types with pure adapters. Reviews require fulfilled orders, a valid review window and eligible recipients. Reactivation requires explicit consent, approved template, frequency-cap compliance and eligible recipients. Neither path sends messages or wires domain callers.

WA-10, WA-11 and WA-12 parallel dry-run slice adds support inbound-reply and admin approved-message event types plus central automation controls. Support rejects unsafe or unauthorized replies; admin messaging requires Super Admin privilege, messaging permission, recipient authorization and preview approval; the central engine enforces kill switch, dry-run, template approval and queue caps. No live provider, route caller or production send was enabled.

Lifecycle bridge follow-up adds `recordBuiltAutomationEvent`, allowing authoritative domain transactions to build a validated event and record it atomically in the outbox, while ineligible results remain no-ops. No existing payment/order caller has been changed yet because the repository has no centralized lifecycle event boundary; caller-specific wiring remains an integration task.
