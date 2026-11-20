# Blueprint

OPT-01 (confirmed, R1, tooling owner). The architecture check launched one Git process per oversized file (105 at baseline), and new violations became exempt once committed. Replace HEAD-dependent exemptions with a reviewed path list. Accept on existing-check pass, new-file rejection and a repeat timing comparison. Impact 2, confidence 5, effort 1, risk 1.

OPT-02 (hypothesis, R2, build tooling). Next infers the workspace root from an ancestor lockfile. Compare traced deployable artifacts and Hostinger packaging semantics before changing tracing configuration. No comparable package measurements yet.

OPT-03 (hypothesis, R2/R3, application domains). Profile route bundles, DB access and runtime workloads with isolated fixtures before changing rendering, query behavior or cache policy.

OPT-04 (confirmed, R1, health route). Two `process.memoryUsage()` calls build one response. Reuse one snapshot. Impact 1, confidence 5, effort 1, risk 1. Candidate acceptance is matching mocked 200/503 payloads and one fewer sampling call. OPT-02 inspection found the health trace references an ancestor package manifest. Hostinger artifact inclusion remains unverified, so tracing settings are deferred.

OPT-06 (confirmed, R2) defers Quick Checkout from the root shell until a product is selected. Bundle manifests show initial asset savings. Hold release pending browser checkout and auth-resume acceptance. The existing trace-root and hosting telemetry questions remain open.

OPT-07 (confirmed duplicate call sites, R1) shares product detail and metadata lookup within one React render using `cache`. Keep the dynamic route and existing underlying lookup. Runtime DB query counts still require an isolated server.

The largest local packaging traces are Prisma's Windows engine (19.34 MB), Sharp libvips (19.02 MB), and Baileys WAProto (8.24 MB). DB-backed routes, image optimization and WhatsApp routes respectively reference them. Excluding these assets lacks evidence of runtime safety. Provider artifact contents remain open.
