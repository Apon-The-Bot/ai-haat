# Refactoring baseline

Captured 21 November 2026 on branch `codex/admin-platform`. The working tree was clean before this batch.

| Measure | Evidence |
| --- | --- |
| Relevant repository paths | 945 (`rg --files`, excluding build/vendor output) |
| Checked roots | `src/`, `scripts/` |
| Existing files over 300 lines | 105 |
| Guardrail | `npm run architecture:check` / `scripts/check-source-file-length.mjs` |
| Production | Existing Hostinger deployment; untouched by this refactor |
| Local MySQL | Not verified in this batch |
| Live WhatsApp acceptance | Not verified in this batch |

The 105 oversized files are pre-existing baseline violations. Future batches must record any touched baseline file and its responsibilities; new maintained files over 300 lines are not accepted. Generated output, lockfiles, migrations, reports, and vendor files remain excluded.
