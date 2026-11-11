# Resource optimization baseline — 2026-11-11

## Measured scope

Hostinger reports a completed managed Node.js deployment for aihaat.shop: Node 22, Next.js, npm, build script `build`, output `.next`, with Git auto-deployment on main. The repository also contains a PM2/VPS runbook; its worker settings are not evidence of the active hosting configuration. Local versions: Node 22.20.0, Next 15.5.26, React 18.3.1 and Prisma Client 5.19.1. Source uses MySQL, NextAuth JWT sessions, local media paths, and separate scheduled routes.

Local Windows dry run: enumerated regular files and summed logical file sizes with Node fs. These are working-directory measurements, not production inode counts or a clean production build.

| Directory | Files | Bytes |
| --- | ---: | ---: |
| node_modules | 30,394 | 814,042,867 |
| .next | 206 | 806,179,522 |
| .next/cache (included above) | 125 | 770,263,060 |
| public | 79 | 621,588 |

The brief's 119,646 / 600,000 inode figure is user-reported and not attributable to this site alone. Production CPU, RAM, query timing, filesystem totals, API latency, browser metrics and clean build size were not measured.

## Implemented and verified

`GET /api/notifications` now reuses two Intl formatters per loaded module and requests eight database columns instead of ten. The omitted columns are userId and dedupeKey; the userId predicate remains in place. Query count, sorting, 50-row cap, unread count, live reads, authorization and response fields are unchanged. No migration is needed. Rollback is limited to reverting the notification route diff.

Node microbenchmark: 50 synthetic dates per list, both date/time strings checked for exact equality, median of five batches of 25 lists. Before: 103.57 ms; after: 1.96 ms. This isolates formatting; it does not measure whole API latency or production CPU. Typecheck and lint passed; architecture check reported 109 oversized files outside the changed route. Authenticated route, production startup, fresh production build and full business workflow tests remain unverified for this change.

## Ranked next steps

1. Obtain a read-only per-site Hostinger filesystem and workload baseline. Separate build cache from runtime image/cache files before evaluating packaging exclusions. Compare a clean staged release with the existing layout and verify cold startup, images, uploads, and rollback before changing deployment.
2. Measure order polling: authenticated clients currently call the order endpoint on a 30-second interval. Compare returned fields and query plans using staging fixtures before changing polling, authorization or notification behavior.
3. Profile shared client chunks and image variants on equivalent staging routes before deferring interactive components or changing derivative generation. Record p50/p95 and error counts alongside file sizes.

## Follow-up: lightweight order polling and build packaging

The new internal `GET /api/orders/notification-feed` uses the same authentication guard and applies the existing account ownership rule. It selects the latest 25 rows with no pagination count or relation fetches, and retains the existing JSON fallback's visibility and order. Customers receive only the order identifier and delivered state; admins also receive the fields used by their alert. The browser keeps the 30-second interval, skips overlapping polls, aborts outstanding requests when the session changes or the effect unmounts, and times out a stuck request after 60 seconds. Existing order list, detail, and mutation contracts are untouched.

| Metric | Before | After | Conditions |
| --- | ---: | ---: | --- |
| Customer poll JSON | 15,480 B | 670 B | Same 20 synthetic matching orders; actual handlers with mocked Prisma |
| Customer poll gzip | 786 B | 142 B | Node gzip on the same responses |
| Admin poll JSON | 19,331 B | 2,629 B | Same 25 synthetic orders; actual handlers with mocked Prisma |
| Admin poll gzip | 865 B | 219 B | Node gzip on the same responses |
| Order-specific Prisma calls per successful poll | 2 | 1 | Count + list (which also loads relations) versus scalar list; excludes the unchanged auth guard |
| Isolated production build output | 522,605,387 B | 30,298,577 B | Same build, with only the webpack compiler cache omitted from runtime output |
| Isolated output filesystem entries | 2,348 | 2,338 | Regular files plus directories below `.next`; not Hostinger account usage |

The separate clean fixture used installed dependencies, a loopback-only server and an unreachable loopback database URL. The build passed and processed the Tailwind CSS. Product route smoke checks exercised the existing catalog fallback. Before and after moving the compiler cache outside the isolated output, the server started and returned expected statuses for home, shop/search, product detail, order tracking, login, dashboard and admin shells, inventory batch shell, and unauthenticated orders/notifications APIs. The guest checkout redirect was verified in the streamed response. After the move, a first WebP request exercised the runtime image optimizer, and 12 concurrent local smoke requests passed. This validates a packaging candidate in isolation; Hostinger's managed packaging has not been changed.

Reproduce the inventory with `node scripts/measure-build-output.mjs [application-root]`. It reads `.next` without following symlinks, reports totals and separates the webpack compiler cache from runtime files. Reproduce the order checks and payload measurements with `node scripts/test-auth-boundaries.mjs`. The fixture suite covers guest rejection, customer ownership and historical orders, admin feed parity, fallback, and existing purchase and duplicate payment webhook checks. Meta tracking fixtures, typecheck, and lint passed. Architecture check remains at 109 pre-existing oversized files.

### Deployment and rollback

- Revert the feed route, feed service, and NotificationContext changes together to restore the previous poll. No data or schema rollback is required.
- If a future runtime-only archive excludes `.next/cache/webpack`, retain the cache on the build worker and keep the previous deployable artifact. Reinclude the directory if a deployment system needs it. Do not exclude the entire cache tree or runtime assets by analogy.
- Hostinger's document-root API showed a small proxy document root with sub-sites; it did not expose the managed Node.js build directory. The Agency Plan lookup returned no matching site. Production CPU, RAM, database query timing, API latency, deployed file counts, and runtime build-cache retention remain unmeasured. The previously reported inode total is shared account context, not an AI Haat measurement.
- Next candidates: obtain managed build and runtime file inventories; inspect the public product listing's per-stock-row fetch versus a live grouped count with staging query plans and stock concurrency tests; profile initial JS and browser timings. Set budgets using representative production time series, rather than fixture measurements.

No push, production deployment, production deletion, database change, or production load test was performed. Real authenticated workflows, live database performance, browser-level interaction coverage, and production resource savings remain unverified.
