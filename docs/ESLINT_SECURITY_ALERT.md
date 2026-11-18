# ESLint Security Alert Disposition

## Finding

The reported `CVE-2025-50537` / `GHSA-p5wg-g6qr-c7cg` alert targets ESLint versions below `9.26.0`. GitHub’s advisory database marks this advisory **withdrawn on February 3, 2026**. The withdrawal explains that the affected `RuleTester` path is used for testing rules during development and produces an error rather than crashing the application.

## Project impact

- ESLint is a direct `devDependency` at `^8.57.1` and is not part of the production dependency set.
- The project uses `eslint-config-next` with the legacy `.eslintrc.json` configuration and the `next lint` script.
- No project source or script invokes ESLint `RuleTester` or passes attacker-controlled circular objects to that helper.
- The installed dependency tree resolves ESLint `8.57.1`; `npm audit --json` currently reports zero vulnerabilities.

## Resolution

No dependency or configuration upgrade was made. This is the smallest safe resolution because the only reported advisory is withdrawn and the suggested ESLint 9 upgrade would require a deliberate configuration migration. ESLint 9 changes the default configuration format to `eslint.config.js` and has other breaking changes, so upgrading solely to clear a withdrawn scanner result would increase compatibility risk without fixing an active vulnerability.

Security scanners that continue to display this item should refresh their advisory database or dismiss only `GHSA-p5wg-g6qr-c7cg` as withdrawn, with this document as the rationale. The scanner itself must remain enabled for all other advisories.

## Verification

- Node.js: `v22.20.0`
- npm: `10.9.3`
- `npm audit --json`: passed; 0 vulnerabilities across 515 installed dependency entries.
- Installed ESLint tree: `eslint@8.57.1`, consumed by the Next.js ESLint configuration and TypeScript ESLint packages.
- No package versions, lockfiles, application code, APIs, authentication, database schema, or deployment configuration changed for this finding.

## Remaining limitation

The remote scanner’s own alert state was not modified because no scanner integration or supported dismissal workflow is configured in this repository. If it remains visible, it is an advisory-database/reporting limitation, not evidence that this project has an active CVE-2025-50537 exploit path.
