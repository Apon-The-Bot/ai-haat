# Test and QA report

`scripts/test-supplier-intelligence.ts` covers alias normalization, availability normalization, positive and conflicting matches, lowest-cost selection, and disabled-supplier exclusion using local assertions only. The local checks passed: `npx tsx scripts/test-supplier-intelligence.ts`, `npm run typecheck`, `npm run lint`, `npm run architecture:check`, and `git diff --check`. Lint reports only pre-existing warnings.
