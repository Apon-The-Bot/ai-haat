# AI Haat branch audit and merge report

## Repository and recovery

The original active branch was `codex/admin-platform`. GitHub advertised `main` as the default. The single remote was `origin`. Fetch returned two remote branches and there were two local branches, excluding the symbolic `origin/HEAD`. No tags or GitHub releases were listed. One worktree was registered before integration. It was clean and there were no in-progress Git operations. Both historical stashes were left intact.

| Original ref | Full commit | Last commit date (Dhaka) | Recovery ref |
| --- | --- | --- | --- |
| `main` | `8902231700f1aaf81dfb7de1b80c8b98041f9285` | 2026-11-11 | `codex/recovery-main-pre-audit` |
| `origin/main` | `4417e32df314a8ca7a7ed2a2d88b0d29d7f44642` | 2026-11-11 | `codex/recovery-origin-main-pre-audit` |
| `codex/admin-platform`, `origin/codex/admin-platform` | `51290fab8baf48bdf210fe71ef30d8a456bfbc6c` | 2026-11-17 | `codex/recovery-admin-pre-audit` |

Shared merge base for local `main` and both remote lines of work is `e0140f8a256daaf12c1cacfafc7756dd1e9c117b`. The admin branch's merge base with `origin/main` is `4417e32`. Local `main` is one ahead and one behind `origin/main`. Relative to local `main`, the admin branch is two ahead and one behind. Relative to `origin/main`, it is one ahead and zero behind. The local and remote admin refs were identical.

## Integration decisions

| Branch | Unique Changes | Integration Method | Merge Status | Validation Status | Remarks |
| --- | --- | --- | --- | --- | --- |
| `main` | `8902231`, clean startup path and broader root env ignores | Integration base | Ancestor of candidate | Candidate tested | Local default remains at its original tip. |
| `origin/main` | `4417e32`, same subject as `8902231` with four tree differences | Ancestry through admin, unsafe tree differences excluded | Historical parent only | Static inspection | Requires security review. The differences were `.gitignore`, `init`, `next.config.mjs`, and `package.json`, with a substantial line-ending component in the last two. |
| `codex/admin-platform` | `51290fa`, operational interfaces, API and workflow improvements | Two-parent merge with explicit reconciliation | Integrated into candidate | Build, typecheck, lint and local fixture tests | Retains feature history. Excluded inherited `init`. |
| `origin/codex/admin-platform` | Same tip as local admin branch | Covered by local branch merge | Integrated by ancestry | Same candidate validation | Duplicate ref. |

The same-subject main commits are distinct by Git patch comparison. Ignoring carriage returns, the remote-only differences include the executable bootstrap, npm invocations of it, appended obfuscated executable content in the Next.js config, and narrowed env ignores. Source, schema and lockfile trees match between the two main tips. The admin tip removed the active npm/config execution paths and still tracked the inherited bootstrap. The candidate excludes it and keeps the clean startup config. Suspect code was inspected as repository data and was never executed during this audit. Historical objects and remote refs remain recoverable. Static inspection does not establish whether previously used systems executed the code.

Relative to `origin/main`, the admin commit adds 90 paths and modifies 31. Git detected no deletions or renames. Changes cover routes, components, server functions, tests, and the provider migration. It extracts admin navigation for both form factors, adds operations queues and order investigation, introduces MFA-gated second-admin approvals, extends scoped staff access, filters internal notes from customer order responses, and adds inventory preview, supplier and provider catalog workflows, demand reporting, reconciliation, search, and scheduled reporting interfaces. Workflow review compared authorization, refund and wallet service extraction, snapshot synchronization, schema, and UI entry points.

The only merge conflict was `src/components/admin/AdminLayoutClient.tsx`. Local `main` and `origin/main` had equivalent baseline layout content once line endings were ignored. The extracted `AdminMobileNavigation` and shared navigation kept the updated menus and existing admin access gate. The completed merge has no conflict markers. It does not reinstate the previously rolled-back three-color redesign. Storefront theme, layout, logo, media, Google auth, gateway handlers, and Meta integration remain based on the existing committed implementations. Order API changes are limited to the admin branch's own reconciliation.

The newer stash (`653abbf`) has 120 paths, of which 119 match the admin implementation after accounting for carriage returns. The remaining ignore-file difference is addressed by retaining the development build ignore rule and restoring root env protections. The older stash (`c0fc3f6`) is a legacy workspace snapshot, with 165 of 192 paths already byte-matched, 25 divergent paths, and two omitted development logs. Divergences include older auth, purchase, invoice, admin and navigation implementations and repository configuration. The stash was preserved as reference. Those draft versions were excluded from the candidate.

## Database, build and security

- The only new migration is `20261111_provider_catalog_snapshots`. It follows the Meta tracking migration, adds two provider catalog tables and their indexes, and has a unique migration identifier. Existing migrations retain their content and order. Prisma schema validation passed. SQL replay against MySQL remains unverified.
- The dependency lockfile is identical across all original branches. No package versions were changed. The integration tracks the existing ESLint rules to make lint reproducible. The developer env template has empty secret fields and a loopback database placeholder. The secret gate checks both approved templates and still rejects private env files.
- The repository's production audit gate failed with ten high-severity dependency findings in the Tailwind 3 glob dependency tree. npm reports a Tailwind 4 major upgrade as the comprehensive automatic fix. The same lockfile predates the integration. No major migration or audit bypass was introduced.
- Existing hook dependency and image lint warnings remain. The shop had 26px document overflow at 390px in both the pre-integration and candidate browser runs.

## Validation and release status

- Typecheck, lint, Prisma schema validation, and the repository secret gate passed. The isolated production build completed with the fallback catalog because MySQL was unavailable. A second build used a fresh `npm ci --ignore-scripts` install, generated Prisma Client and passed typecheck and build on the pinned Next.js 15.5.29.
- Admin approval and staff scope fixtures passed. Auth, purchase, payment webhook and order notification fixtures passed.
- Browser checks rendered home, shop, cart, the customer access screen, and the admin overview and operations access screens. Shop search, cart persistence, and quantity changes worked against the fallback catalog. Operations, customer admin, wallet transactions, and approval submission rejected anonymous access with HTTP 401. The first smoke probe used GET on the POST-only approvals endpoint and received the expected HTTP 405. A corrected POST probe verified authorization.
- Authenticated OAuth, wallet and checkout writes, payment sandbox, provider synchronization, admin workflows against real data, full browser and accessibility coverage, migration replay and load tests remain unverified.

The code merge is `76306c25a4123d834af9c21d0aab1aa70deafa64` on `codex/branch-audit-integration`. The report is committed separately on that branch. The branch has no remote upstream. The original admin branch remains synchronized with `origin/codex/admin-platform`. Local and remote `main` still diverge one commit on each side. The high-severity dependency gate blocks promotion, so the integration stays on its own branch. No remote push, history rewrite, production migration, deployment or real transaction occurred.

To recover an original line of work, create a new branch from the corresponding recovery ref with `git switch -c <recovery-branch> <recovery-ref>` in a clean worktree. The remote-main recovery ref is for inspection only because it contains the suspect startup files.
