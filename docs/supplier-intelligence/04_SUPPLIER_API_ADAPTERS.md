# Supplier API adapters

Existing provider catalog fetching is implemented in `src/lib/provider-catalog.ts` with bounded pagination, timeout handling, response validation, and snapshot retention. No verified external order-purchase adapter was found. Provider-specific adapters must be added only after endpoint, authentication, idempotency, rate limits, and refund behavior are confirmed.
