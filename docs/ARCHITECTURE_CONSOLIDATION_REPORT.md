# Architecture consolidation report

## Current canonical systems

- Authentication and authorization: NextAuth session plus server-side auth/admin guards.
- Customer identity/profile: Prisma `User` and profile APIs.
- Affiliate: `AffiliateProfile`, `ReferralClick`, `AffiliateCommission`, `AffiliatePayoutRequest`, and `src/lib/commerce/affiliates.ts`.
- Orders/payments/wallet: existing order lifecycle, payment routes, and wallet ledger; no replacement system introduced.
- Notifications: existing event/template service and channel adapters.

## Consolidation completed

The customer-facing Referral page was removed from active navigation and its historical URL now redirects to `/dashboard/affiliate`. The unified earnings page labels acquisition rewards and commissions as classifications within the Affiliate program. The referral service remains a compatibility layer for existing milestone obligations and delegates profile identity creation to `AffiliateProfile`.

## Deliberately not removed

`/api/referrals/me`, milestone reward code, and historical referral terminology remain until a database-backed dry run proves that restricted credits, historical links, and obligations can be migrated safely. Deleting those paths now would violate financial preservation requirements.

## Remaining architecture work

Payment reconciliation, subscription renewal authority, automation inventory, analytics formula fixtures, and production migration gates require configured isolated environments. No duplicate replacement ledger or payment engine was introduced.
