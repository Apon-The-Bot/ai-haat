# Coding rules

- Preserve public routes, API payloads, auth checks, environment names, and visual behavior.
- Keep maintained handwritten source files at or below 300 physical lines; split by responsibility, not arbitrary line count.
- Keep feature code near its route/domain and use `@/*` for `src` imports.
- Keep server-only integrations out of client modules and mark client boundaries explicitly.
- Prefer small named services and validators over broad utility barrels.
- Make side effects, transaction boundaries, retries, and idempotency visible at call sites.
