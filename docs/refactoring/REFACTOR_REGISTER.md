# Refactor register

| Batch | Scope | Risk | Status | Evidence |
| --- | --- | --- | --- | --- |
| 0 | Navigation docs, dependency map, baseline policy | Low | Complete | Repository inventory and architecture scan |
| 1 | Shared utilities, types, isolated UI | Low | Planned | Targeted tests plus full checks |
| 2 | Feature UI responsibility extraction | Medium | Planned | Route and component regression checks |
| 3 | Commerce and admin services | High | Planned | Auth, transaction, and API contract checks |
| 4 | Auth, payments, database, WhatsApp | Critical | Planned | Explicit acceptance evidence required |

Batch 0 performed no production deployment, environment change, migration, cron registration, or live message delivery.
