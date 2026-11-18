# AI Haat engineering master register

Verification baseline: commit `f099ed8`, 2026-11-19. Existing unrelated working-tree changes (`tsconfig.json`, `.next-profile-settings/`, `.next-wishlist/`) are preserved.

| ID | Domain | Evidence | Priority | Status | Verification |
|---|---|---|---|---|---|
| ENG-001 | Affiliate consolidation | `AffiliateProfile`, affiliate ledger/payout APIs, canonical dashboard; historical referrals redirect | P0 | Implemented in safe compatibility phase | 25/25 + 33/33 affiliate assertions passed |
| ENG-002 | Payment integrity | Payment create/callback/webhook routes and idempotency checks | P0 | Audit required | Production gateway/database blocked |
| ENG-003 | Wallet integrity | Wallet ledger and affiliate wallet transfer path | P0 | Existing implementation retained | Source-level only; fixture DB required |
| ENG-004 | Subscription lifecycle | Subscription models, reminder cron and dashboard routes | P1 | Partial | Recurring provider capability unverified |
| ENG-005 | Notifications | In-app, email, Telegram event/template services | P1 | Existing centralized paths retained | Source-level only |
| ENG-006 | Analytics/reporting | Meta events, analytics utilities and admin reports | P2 | Metric definitions require audit | No production analytics access |
| ENG-007 | Recommendations | Existing frequently-bought-together/product discovery components | P2 | Deterministic baseline exists | Engagement measurement pending |
| ENG-008 | Performance | Sharp media optimizer and Next build | P3 | Existing optimizer retained | Build page-data blocked by missing `DATABASE_URL` |
| ENG-009 | Production readiness | Prisma migrations and deployment checks | P0 | Blocked | Safe production DB credentials/backup window required |

## Acceptance gate

No financial migration, payout, recurring billing, or production deployment is declared complete until it has an isolated database fixture, reconciliation evidence, and rollback procedure.
