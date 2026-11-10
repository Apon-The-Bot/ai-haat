# Refactoring baseline — 2026-11-10

This is the baseline for the architecture refactor. The working tree already contained user changes before this work; those changes were preserved.

## Discovered stack

- Next.js 15.5 App Router, React 18, TypeScript 5.6
- Prisma 5 with a repository schema at `prisma/schema.prisma`
- NextAuth 4, Tailwind CSS 3, Node-based maintenance scripts
- Domain/integration code primarily in `src/lib`; UI in `src/components`; routes/API in `src/app`
- Existing `@/*` path alias maps to `src/*`

## Baseline validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Completes with warnings; no reported errors |
| `npm run build` | Pass; 109 pages generated |
| `npm run architecture:check` | Fails as expected: 111 maintained source/script files exceed 300 lines |

## Structural observations

The repository has 548 source/script files under `src/`, `scripts/`, `prisma/`, and `docs/` discovery scope. The largest maintained source files are `src/lib/email-templates.ts` (1,983 lines), `src/app/admin/users/[id]/page.tsx` (1,978), and `src/app/admin/orders/page.tsx` (1,816). These are prioritized for responsibility-based extraction in later batches.

## Known warnings and risks

Lint reports existing hook dependency and raw `<img>` warnings. Next.js also reports multiple lockfiles and an inferred workspace root. No payment, authentication, or production-data workflow was invoked during this baseline.
