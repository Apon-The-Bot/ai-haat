# Checkpoint

`codex/production-optimization` starts at `bbf69ad` with no protected dirty paths at entry. OPT-01 passed build, lint, typecheck and checker fixtures. See [progress](04_PROGRESS.md), [checks](06_TEST_REPORT.md) and [metrics](07_PERFORMANCE_DELTA.md). Resume with `git status --short`, then inspect `next.config` and `.next` trace manifests for packaging evidence. Compare route bundles and prepare isolated runtime fixtures before the follow-on work in the [blueprint](03_BLUEPRINT.md).

OPT-04 passed mocked health 200/503 parity, typecheck and architecture checks. Read [baseline](02_BASELINE.md) before using build output as deployment evidence. Starting rollback reference remains `bbf69ad`. Next compare package manifests with an isolated build, profile candidate route chunks, and establish isolated MySQL compatibility before running DB-backed suites.

OPT-05 passed targeted checks. Subscription Desk now reuses its formatter across both tables per render. The next build and runtime profiling should use isolated configuration. Prior batch changes remain in the working tree.

OPT-06 completed the isolated candidate build and initial JS manifest comparison. Next reproduce both builds with matching fixture configuration and run authenticated browser checkout/Subscription Desk tests when isolated session and database fixtures are available. See [test report](06_TEST_REPORT.md) and [metrics](07_PERFORMANCE_DELTA.md).

Checkout verification resumed. Playwright and Chrome are present. The isolated `next start` command on loopback port 3137 was rejected by execution policy and no listener was found. Browser acceptance remains pending an authorized isolated server. The existing candidate loadable manifest was inspected for first-open asset sizes.

AppShell render-branch fixture passed. Prioritize actual chunk failure and retry in the browser because the dynamic loader uses React lazy and the shell defines no checkout-specific recovery boundary. Payment, auth resume and timing gates remain open.

Chrome ran both built homepages through Playwright request interception using local HTML/JS and blocked external requests. Candidate desktop and mobile opened with a mocked session, handled Escape and a second click, and requested the modal chunk once. Continue with explicit dialog visibility assertions, chunk failure/retry and matched builds. Full backend acceptance still needs an isolated server.

OPT-06 recovery verified in Chrome. Aborting the old candidate's first modal chunk produced an uncaught ChunkLoadError and hid the storefront. The revised AppShell catches the failure, displays retry, and retains the mounted modal after loading. The rebuilt fixture passed explicit visibility checks for retry, Escape and reopen. Next run matched builds and broaden fixture coverage to rapid clicks, focus, session resume and payment selection. Backend acceptance remains open.

Matched local checkout comparison finished in the detached comparison worktree at `bbf69ad`, with five Chrome samples per variant. See performance and test reports for raw asset and interaction metrics. Next exercise slow delivery, rapid clicks, keyboard focus and guest flow. Real session, database and payment gates remain open.

Slow delivery, rapid clicks and guest login initiation passed in the browser fixture. Focus initially stays on Buy Now in both variants. Next verify supported payment selection and mocked session continuation without submission, then move to the highest-impact independent backlog item. Real sign-in and payment acceptance remain open.

Mocked login continuation and payment selection passed. Measured local trace union sizes as a packaging baseline. Next identify the largest traced dependencies and confirm their runtime owners before attempting a packaging change. Full backend and provider acceptance remain open.

OPT-07 implemented render-scoped product lookup reuse. Typecheck, architecture check and a VM route fixture passed. The fixture used a mock React render cache and yielded identical found/missing responses with six versus three lookup calls across three fixtures. Real Next render and Prisma query counts remain unverified. Next verify OPT-07 in an isolated server and continue build/hosting profiling. See blueprint for traced runtime owners.

OPT-07 production build and bundled React-cache fixture passed. Added detached build-stage timing evidence. The largest trace dependencies still have confirmed runtime owners. Next investigate file-tracing root under an equivalent packaging trial and measure runtime with an authorized isolated server. Integration acceptance remains open.

Rejected the narrower tracing root after a detached build omitted required dependency paths. Main worktree config stayed unchanged. Read the performance report before revisiting packaging. A valid repeat needs dependencies physically inside the test checkout and a deployment-closure smoke test.

OPT-08 reuses a per-product stock tally for list and detail mapping in products-db. Verify integrated timing with an isolated catalog and keep provider trace qualification open.

OPT-09 removes the unused stock ID from both Prisma result projections. Final list/detail parity and static checks passed. Public catalog already uses a grouped tally and selects variation IDs only. Chrome full-document away/back/forward checkout passed on matched fixtures. Next measure database-backed behavior in isolation and test client-side navigation and keyboard traversal.

Client-side Home/About Back/Forward and checkout chunk reuse passed with built RSC fixtures. Keyboard traversal parity reproduced the shared focus defect. Next validate the combined catalog and checkout candidate build and exercise isolated backend flows when runtime fixtures are available.

Combined candidate build and intercepted wallet/gateway submit fixtures passed. Wallet success still ignores Escape until explicitly closed, in addition to the existing focus issue. Next address checkout keyboard accessibility or qualify isolated backend gates when fixtures are available.

OPT-10 fixed checkout focus, Tab containment, and Escape after wallet success. Combined production build and Chrome fixture passed. Remaining work includes real DB, OAuth/payment/WhatsApp acceptance, screen-reader coverage and Hostinger package verification.

Hostinger deployment metadata read succeeded. Existing main deployment is 6fe807f, and historical install, compile and build durations are recorded. Artifact bytes and Business-plan runtime utilization were not exposed by the queried operations. Candidate remains local.
