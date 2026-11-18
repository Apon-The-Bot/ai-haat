# Affiliate consolidation report

## Audit baseline

The repository already has one financial identity model (`AffiliateProfile`) with `ReferralClick`, `AffiliateCommission` and `AffiliatePayoutRequest` relations. The former referral service (`src/lib/commerce/referrals.ts`) already resolves profiles through `getOrCreateAffiliateProfile`, so it is a compatibility/reward layer rather than a second profile table. The remaining separate surfaces were `/dashboard/referrals`, `/api/referrals/me`, `ReferralHubClient`, and referral-oriented navigation/copy.

## Implemented in this release

- Affiliate is now the sole customer-facing program navigation destination.
- Historical `/dashboard/referrals` URL redirects to `/dashboard/affiliate` instead of rendering a separate program.
- The unified earnings page uses “Affiliate earnings”, “Acquisition rewards” and “Commission earnings” classifications.
- No database tables, balances, commissions or historical records were deleted or rewritten.
- Existing `/api/referrals/me` remains as a compatibility endpoint because it still serves milestone reward functionality; it delegates identity creation to the canonical AffiliateProfile.

## Canonical architecture

| Capability | Canonical implementation | Status |
|---|---|---|
| Affiliate identity/code/link | `src/lib/commerce/affiliates.ts` + `AffiliateProfile` | Active |
| Click and order attribution | `ReferralTracker` + `affiliates.ts` | Active |
| Commission ledger | `AffiliateCommission` | Active |
| Payout workflow | `AffiliatePayoutRequest` and affiliate payout APIs | Active |
| Customer dashboard | `/dashboard/affiliate` | Active |
| Historical referral rewards | `referrals.ts` compatibility layer | Preserved, pending rule migration |

## Not yet performed

Historical financial reconciliation, dry-run data migration, milestone-rule migration into configurable Affiliate rules, and deletion of the compatibility service were not executed because no production/synthetic database is configured in this worktree. Removing them without reconciliation could lose restricted credits or historical obligations.

## Verification

TypeScript typecheck and `git diff --check` passed. No production database migration or payout test was run. Commit `655d029` was pushed to `origin/main`.
