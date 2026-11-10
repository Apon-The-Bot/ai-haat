# AI Haat agent guide

AI Haat is a Next.js 15 App Router application using React 18, TypeScript, Prisma, NextAuth, Tailwind CSS, and server-side integrations for commerce, payments, subscriptions, email, and media.

## Fast navigation

- Route entries and API handlers: `src/app/`
- Customer-facing UI: `src/components/`, `src/app/dashboard/`, and feature route folders
- Admin UI: `src/app/admin/` and `src/components/admin/`
- Business and integration logic: `src/lib/` (commerce, auth, orders, payments, subscriptions, email, user-control, and user-intelligence)
- Reusable hooks, types, and utilities: `src/hooks/`, `src/types/`, `src/utils/`
- Database contract: `prisma/schema.prisma`
- Existing architecture and QA evidence: `docs/`

## Safety rules

Preserve public URLs, API methods and payloads, auth/authorization checks, payment and subscription behavior, database transactions, environment variables, and visual behavior. Treat existing working-tree changes as user-owned. Do not reset or overwrite them. Keep framework-required route files in place and extract implementation only when behavior is covered.

## Conventions

Use the existing `@/*` alias for imports from `src`. Keep feature-specific code near its route/domain and move code to shared locations only when ownership is genuinely cross-feature. Avoid broad barrel files and new circular dependencies. Maintain readable files; manually maintained source files must be 300 physical lines or fewer. Generated, vendored, lock, build, and report artifacts are excluded by the checker.

## Validation

- `npm run typecheck`
- `npm run lint` (the installed Next version may require migration if this command is unavailable)
- `npm run build`
- `npm run architecture:check`

Run targeted scripts under `scripts/` only with safe fixtures and never against production payment or customer data. Read `docs/PROJECT_MAP.md` and the relevant feature README before making a cross-cutting change.
