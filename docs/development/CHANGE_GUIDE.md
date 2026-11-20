# Change guide

Before editing:

1. Read `docs/PROJECT_MAP.md` and `docs/architecture/FEATURE_INDEX.md`.
2. Identify the route, direct domain dependencies, persistence boundary, and authorization boundary.
3. Check `docs/refactoring/REFACTOR_REGISTER.md` for an existing batch.

For each batch:

- Keep one feature boundary and one reviewable purpose.
- Preserve public contracts and add a focused regression check before extraction.
- Run typecheck, lint, architecture check, and build as risk requires.
- Record changed responsibilities, validation, and unverified behavior.
- Do not deploy or modify production infrastructure as part of refactoring without explicit authorization.
