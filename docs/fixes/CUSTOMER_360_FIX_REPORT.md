# Customer 360 fix report

## Code changes

- `/api/admin/users/[id]` now returns `CUSTOMER_NOT_FOUND` only after an authorized lookup succeeds and returns no user.
- Unexpected database/backend failures now return `PROFILE_LOAD_FAILED` with a safe generic message and correlation ID.
- Server logs include the correlation ID, operation, user ID, error class, and safe diagnostic text; raw diagnostics are no longer returned to ordinary admins.
- The Customer 360 page now distinguishes missing customers from load failures and provides a retry action.

## Database and deployment

The required database change already exists as migration `20261119100000_reward_claim_idempotency`; it has not been applied by this task. The configured database reports that migration and later migrations are pending. An authorized production deployment must apply the reviewed migration chain with backup and rollback/recovery planning.

## Compatibility and risks

No schema, data, or migration files were changed. Existing wallet balances, transactions, orders, subscriptions, and customer records were not modified. Until the pending migration chain is applied, any Prisma query that touches the newer schema can still fail in the affected environment.

## Status

Application error handling is fixed and build-safe. The production schema mismatch remains an explicitly documented deployment blocker; the incident is not claimed resolved in production.
