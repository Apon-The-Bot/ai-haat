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
