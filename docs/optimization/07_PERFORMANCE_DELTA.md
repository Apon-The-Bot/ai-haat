# Performance delta

| Metric | Baseline | After | Delta | Change | Method | Confidence |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Local architecture check median | 1974.4 ms | 92.6 ms | −1881.8 ms | −95.3% | PowerShell wall clock, three runs per version | Direction strong, small sample |

After samples were 93.1, 88.3 and 92.6 ms. Candidate runs overlapped other local checks. Build duration, deploy size, runtime latency, CPU and RAM have no comparable measurement.

OPT-04 local Node 22.20.0 microbenchmark used `performance.now()`, 30,000 iterations per case, one discarded warmup pair and five alternating-order pairs. Median double sampling was 22.42 ms and single sampling was 11.55 ms, a reduction of 10.87 ms (48.5%) per 30,000 iterations. Ranges were 22.30–22.97 ms and 11.43–12.76 ms respectively. This measures the sampling operation alone. Endpoint latency and production resource usage remain unknown.

OPT-05 local Node benchmark formatted 200 dates per case across five alternating-order measured pairs after three warmup pairs. Median went from 8.563 ms to 0.304 ms (−8.259 ms, −96.4%). Ranges were 8.370–8.724 and 0.289–0.322 ms. This measures date formatting in Node. Browser render time is unmeasured.

OPT-06 compares the existing `.next` manifest to `.next/optimization-candidate`. Deduplicate layout and route JS assets and sum Node `gzipSync` lengths per file. Layout 345,532 → 336,323 B (−9,209 B, −2.67%), home 352,627 → 344,694 B (−7,933 B, −2.25%), Subscription Desk 348,391 → 339,194 B (−9,197 B, −2.64%). One artifact per side. Build destination and database fixture differ, so these are directional initial-asset estimates. Browser transfer, first-open wait and build-time deltas remain unmeasured.

The candidate checkout loadable entry lists two JS files totaling 40,878 raw bytes and 11,739 bytes summed with Node gzipSync. One file is initial on one route elsewhere; the modal-specific file is 6,959 gzip bytes and absent from all initial route lists. These sizes describe the manifest and artifacts, with no observed network requests.

Playwright Chrome intercepted requests from static homepage HTML. One fresh context per build with service workers blocked and route-fulfilled local files requested 20 distinct JS files totaling 1,189,085 raw bytes for the earlier build and 21 totaling 1,153,241 for the candidate (35,844 fewer bytes, 3.01%). This measures browser-requested raw fixture bytes. HTTP compression, network latency and matched build conditions were outside this sample.

Rebuilt recovery candidate homepage manifest totals 342,728 gzip bytes, compared with the earlier eager build's 352,627 (9,899 bytes lower). Same manifest calculation as above. Build configurations still differ and actual network transfer and interaction latency remain unmeasured.

Matched local fixture comparison at `bbf69ad`: two production builds in one detached worktree, sharing Node and installed dependencies, dummy auth variables and unreachable loopback DB. Candidate applied only the AppShell code change. Output directories differ. Chrome Playwright used five fresh 390×844 contexts per build, alternating order, with intercepted local assets and mocked API responses. Distinct initial JS requested was 1,189,093 → 1,149,843 raw bytes (−39,250 B, −3.30%). Click to visible close button median/p95 was 125.2/129.6 → 132.9/136.7 ms on first open and 65.1/135.9 → 65.3/66.9 ms on reopen. With n=5, p95 is the maximum and sensitive to outliers. Timings include automation and local fixture delivery. Network transfer under production compression and throttled first-open behavior remain open.

Packaging investigation read 285 NFT manifests per build, resolved references relative to each manifest, deduplicated paths and summed existing files. Eager: 1,612 paths and 74,620,678 bytes. Deferred: 1,615 paths and 74,597,045 bytes. Both included 60,601,402 bytes outside the detached checkout, which shared installed dependencies via a junction. These are local trace sums, excluding unresolved paths. Hostinger upload size and packaged dependency footprint remain unverified.

Detached worktree build traces reported eager/deferred total build spans of 51.94/50.98 s. Node file tracing took 12.57/12.42 s and static generation took 7.39/7.46 s. One sample per variant, with overlapping stages possible. File tracing is a candidate for investigation, while these samples do not establish a build speedup.

Detached tracing-root experiment: setting the root to the checkout yielded total build 45.88 s and file tracing 4.88 s, versus 50.98 s and 12.42 s on the earlier deferred build. The new traces omitted 1,250 paths totaling 60,269,352 bytes, including the Prisma engine, Sharp runtime, Baileys and Next runtimes, because dependencies resolve through a junction outside the checkout. Build succeeded with shared modules present. The trace closure failed parity, so the config change was discarded. These timing deltas are not a safe optimization.

OPT-08 synthetic stock count benchmark on local Node used 600 products per batch, five alternating measured runs and three warmup pairs. Median old/new elapsed time for 8 variations and 50 stock rows was 0.95/0.34 ms, and for 30 variations and 1,500 rows was 110.07/6.56 ms. With one variation and 20 rows, the median was 0.15/0.22 ms. The small case remains a single scan. These are stock mapping measurements, excluding database and HTTP time.

OPT-09 projection-aware mock returned 1,500 stock rows. Per lookup, JSON-encoded fixture rows went from 81,001 to 31,501 bytes (49,500 fewer, 61.1%), with identical list/detail DTOs. The numbers describe synthetic Prisma result objects. Physical SQL projection, wire bytes, runtime memory and latency were not measured.

Hostinger read-only deployment lookup for aihaat.shop confirmed a completed Node 22 build from main commit `6fe807f`, with configured output `.next`. Build log durations were 17.4 s for dependency installation, 36.4 s for compilation, and 1 min 38 s for the build. The response did not include artifact bytes, upload duration or runtime CPU/RAM. These historical production timings predate the candidate and are not a before/after comparison.
