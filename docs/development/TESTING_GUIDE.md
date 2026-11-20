# Testing guide

Run the smallest relevant checks after each batch, then the full suite before handoff:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run architecture:check`
4. `npm run build`

For commerce, auth, payment, database, or WhatsApp changes, add targeted safe-fixture tests and record what was not verified. Never run payment, customer-data, production migration, or live-message tests from a local refactor batch.
