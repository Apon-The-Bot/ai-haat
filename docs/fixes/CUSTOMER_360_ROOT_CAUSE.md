# Customer 360 root-cause investigation

Investigation date: 2026-11-22

## Root cause

The Customer 360 endpoint loads `prisma.user.findUnique()` with the `transactions` relation. Prisma therefore queries the `WalletTransaction` model. The repository schema declares:

```prisma
referenceKey String? @unique
@@map("wallet_transactions")
```

Migration `prisma/migrations/20261119100000_reward_claim_idempotency/migration.sql` adds `wallet_transactions.referenceKey` and its unique index.

The workspace's read-only `npx prisma migrate status` check connected to the configured MySQL datasource and reported that this migration is not applied, along with seven later migrations. This is a deployment/schema-version mismatch, not an incorrect relation or field mapping. The missing column error is a genuine consequence of application Prisma metadata being newer than the database schema.

## Affected path

`/admin/users/[id]` → `/api/admin/users/[id]` → `requireAdminMfa()` → `prisma.user.findUnique()` → `User.transactions` → `WalletTransaction` / `wallet_transactions`.

The same field is also used by referral idempotency code and wallet-related Prisma writes, so hiding the field from the Customer 360 include would only defer the incident.

## Evidence

- `prisma/schema.prisma` contains `WalletTransaction.referenceKey` with `@unique`.
- The migration SQL explicitly adds the missing column and unique index.
- `npx prisma migrate status` reported `20261119100000_reward_claim_idempotency` as pending against the configured datasource.
- No production migration was executed by this task.

## Correct remediation

An authorized operator must first confirm backup/recovery readiness, review all pending migrations, and run the project's controlled production migration procedure (`prisma migrate deploy`) during an approved release window. The migration must be validated against a compatible isolated backup/staging database first. Do not use `db push`, reset, destructive SQL, or migration-history manipulation.
