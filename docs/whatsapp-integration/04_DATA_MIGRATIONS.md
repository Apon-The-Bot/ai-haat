# Data migrations

WA-03 adds `whatsapp_automation_events`. The SHA-256 event key is its primary key. The creation-time index supports ordered bounded reads. Rows contain versioned lifecycle references only. No recipient address, message body or credential is stored.

Prisma validation and generation passed. The migration has not been applied. Verify it on isolated MySQL with duplicate concurrent writes and transaction rollback before any producer is enabled. Code rollback can leave the additive table intact. If a migration has been applied, preserve the table and records pending an approved retention decision.

WA-04 adds pending state, due/lease timestamp, claim token and inspection timestamp. The composite due index bounds pending reads by schedule and stable ID. Validate concurrent claims and expiry against isolated MySQL before wiring a scheduler.

WA-05 adds three identity/consent/suppression tables. Composite keys bound consent and suppression lookups and isolate evidence by immutable identity revision. Identity points to User and dependent rows cascade on identity removal. No backfill, no phone normalization or grants in the migration. An eventual verification service must use keyed fingerprints and handle ownership, rotation and re-enrollment. A code rollback should leave the additive tables intact if applied.
