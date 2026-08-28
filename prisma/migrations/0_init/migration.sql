-- Baseline Migration: 0_init
-- Represents baseline MySQL schema for AI Haat before Phase 5 Decimal & FK hardening.
-- Applied during initial project deployment via prisma db push.
-- To baseline on production without destructive table recreation:
-- npx prisma migrate resolve --applied 0_init

SELECT 1;
