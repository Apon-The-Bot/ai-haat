# Release readiness

**CONDITIONAL / NO-GO** for the full optimization candidate. The measured batch improves the local architecture check. A broader release decision requires isolated critical-flow acceptance and comparable runtime and deployment measurements. No deployment performed. Roll back only the owned diff listed in the [change register](05_CHANGE_REGISTER.md).

OPT-04 passed the mocked health contract with comparable sampling measurements. The verdict remains in effect. Release validation needs an isolated MySQL-compatible database, sandbox payment and messaging flows, and comparable build artifact and runtime telemetry.

OPT-05 has local date output parity and targeted checks. The conditional verdict remains in effect pending isolated browser, database and integration acceptance.

OPT-06 reduces manifest-listed initial assets and introduces a first-open chunk dependency. Validate first open on a throttled connection, close/reopen, anonymous login resume, signed-in wallet/gateway selection and analytics with authorized isolated fixtures before shipping. Subscription Desk browser rendering and production telemetry remain open.

The browser gate remains open. Resume against an authorized isolated running server, then validate public and authenticated checkout flows and compare actual browser timings using equivalent builds.

Local browser fixtures cover initial open, retry, Escape, reopen, mocked login resume, payment choice and client navigation. The eager and deferred builds share a keyboard focus defect. Real provider sign-in and payments, database-backed catalog timing, and provider payload qualification remain open.

Combined candidate build passed. A mocked browser observed one order request for each double-click and the expected wallet/gateway request. Real transactions, backend idempotency and provider acceptance are outstanding. Wallet success required its explicit Close control in the fixture.

OPT-10 resolved the fixture's Escape and focus defects. Read-only Hostinger evidence identifies the existing deployment and build timings. Provider artifact size and candidate performance remain open alongside isolated DB and payment acceptance.
