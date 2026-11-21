# EPS payment rollout

The EPS integration is gated by `EPS_PAYMENT_ENABLED`. With the flag off, the existing payment initiation route uses PipraPay. The legacy callback and webhook remain available for in-flight legacy payments.

## Sandbox verification

1. Apply the additive EPS payment-attempt migration to an isolated MySQL database and generate the Prisma client.
2. Configure `EPS_MODE=sandbox` and the sandbox-prefixed `USERNAME`, `PASSWORD`, `HASH_KEY`, `STORE_ID`, `MERCHANT_ID`, and `CHECKOUT_ORIGIN` variables. The web transaction type defaults to 1. Keep values in the server secret store.
3. Enable `EPS_PAYMENT_ENABLED` on the sandbox app after configuration. Confirm the configured checkout origin matches the redirect returned by EPS.
4. Verify order and wallet flows with success, failure, cancellation, duplicate return, and browser-closed scenarios. Compare the EPS status response, attempt, ledger or order, and fulfillment history.
5. Exercise the MFA-protected Check EPS action, then test the authenticated POST reconciliation endpoint at `/api/cron/eps-reconcile` with an isolated scheduler.

Sandbox authentication returned HTTP 200 with a token when using the protected demo credential document and a fresh username HMAC. Full payment initialization, checkout, and reconciliation remain unverified. Local fixture coverage is available through `npx tsx scripts/test-eps-payment.ts`.

The sandbox initialization probe used synthetic customer data and the transaction type from the bundled Postman collection. The gateway returned HTTP 200 with an application error code of 500 and no transaction ID or redirect. The response used PascalCase for initialization fields. The signed initialization payload, transaction ID length, callback URLs, and required merchant fields need to be verified against a successful sandbox request before enabling checkout.

The bundled Postman sample uses transaction type 10. Retesting with a 14-digit transaction ID still returned application error 500. A subsequent request using the guide's web transaction type 1, a 14-digit ID, and merchant/store IDs returned both a transaction ID and redirect. The application uses type 1 for web checkout and generates 14-digit merchant IDs. Sandbox checkout completion and status verification still need a completed test payment.

A later probe using the same field layout produced neither a transaction ID nor a redirect. Sandbox initialization has succeeded at least once, but repeatability and the real status response are unverified.

With the sandbox environment loaded, run `npx tsx scripts/smoke-eps-sandbox.ts` to exercise the actual application client using synthetic billing data. The probe creates an unpaid sandbox checkout and prints only the checkout origin and status field types if successful. Its first run with the protected demo credentials returned initialization error code 500.

A subsequent run of the same application client initialized a checkout at `https://sandboxpg.eps.com.bd` and retrieved its status. The unpaid response contained string values for `Status`, `MerchantTransactionId`, and `TotalAmount`, and omitted `TransactionId`. The verifier therefore permits the stored provider transaction ID when the status response omits it, and rejects a conflicting ID. A paid response still needs verification.

Set `EPS_SMOKE_MERCHANT_TRANSACTION_ID` to an existing sandbox merchant transaction ID to check its status without creating another checkout. Use an EPS-provided test instrument for paid verification. A payment from the public demo link cannot prove that the AI Haat order or wallet routes work.

Set `EPS_SMOKE_PERSIST=true` to exercise the application initialization service and verify its stored pending attempt. This mode requires the loopback `aihaat_eps_schema_fixture` database and a smoke callback origin of `https://example.com`. It cleans up only its own synthetic attempt.

## Production gates

The checked-in EPS migration matches Prisma-generated MySQL DDL. It was applied to an isolated MySQL 8.4.13 fixture database. The `scripts/test-eps-mysql.ts` check verified decimal precision, rejection of duplicate initiation and provider references, and exactly one successful concurrent state change. Full migration-history replay and paid order and wallet verification are separate release checks.

Full replay on a fresh MySQL 8.4.13 database stopped at the historical migration `20260828_money_decimal_and_indexes` with Prisma P3018 and MySQL 1064. The failing statement uses `ADD INDEX IF NOT EXISTS`. Preserve applied migration checksums and verify the target migration history before choosing a repair or baseline strategy. A separate disposable database accepted the current Prisma schema through `prisma db push`, which provides a fixture for integration tests without proving migration-history replay.

A read-only check of the workspace-configured database reported only the EPS migration pending. The read-only schema diff produced the same EPS table DDL as the additive migration and 57 other schema statements. The migration-history result and schema diff are separate signals. Review the unrelated drift with the database owner and apply only the reviewed additive migration through the authorized deployment workflow.

Among the core payment tables, the diff reported a missing `wallet_transactions.referenceKey` column. The historical reward-claim migration declares that column and its unique index. Wallet gateway finalization only uses `trxId` for idempotency and now explicitly selects the wallet fields it consumes. This narrows its dependency while the separate reward-schema drift is reviewed.

On that loopback fixture, `node scripts/test-eps-wallet-mysql.mjs` passed simultaneous wallet and order finalization, one wallet ledger credit, one order timeline transition, and manual review for an extra verified order payment. The test uses the real database and finalization code, with the provider and external side effects replaced by fixtures.

- Confirm merchant-approved request fields, amount and status formats, token response, checkout origin, and refund/reconciliation contract.
- Confirm the merchant-specific IPN authentication and key format before enabling an IPN receiver. Use status reconciliation for browser-independent verification in the interim.
- Verify historical transactions and in-flight PipraPay transactions remain reconcilable.
- Obtain explicit release approval before applying the production migration, enabling EPS, or registering a production schedule.
- To roll back new initiation, turn off `EPS_PAYMENT_ENABLED`. Retain `EPS_MODE`, its credentials, the attempt table, and the reconciliation schedule while EPS attempts are outstanding.
