# Architecture

AI Haat is a modular monolith. Next.js route files are framework adapters; they should delegate substantial domain work to `src/lib` or focused components. The current structure is transitional: feature ownership is visible by route and domain folders, but several legacy modules remain oversized and are tracked for incremental extraction.

## Dependency direction

`src/app` → `src/components` / `src/lib` → Prisma and external integrations. Shared UI and pure utilities must not import route handlers or admin-only business modules. Admin authorization remains server-side at existing boundaries.

## Data flow

Browser interactions enter client components or route handlers, which validate inputs, call domain/integration modules, persist through Prisma, and return the existing response shape. Do not add caching or change transaction boundaries during structural work.

## Ownership

`src/lib` owns server-side orchestration and integration boundaries; `src/components` owns presentation; `src/hooks` owns reusable client state behavior; `src/types` owns cross-domain contracts only. Feature-local contracts should remain local until a second genuine consumer exists.

## Current refactoring constraints

Keep public route paths and API contracts unchanged. Split oversized files by responsibility in small batches, preserving exports and tests. Run `npm run architecture:check`, typecheck, lint, and build after each batch.
