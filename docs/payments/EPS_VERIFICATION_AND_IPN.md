# EPS verification and ipn

The verifier checks successful status, merchant transaction ID, amount, and provider references. Store and currency must match whenever returned. A browser callback triggers verification without acting as payment evidence. Merchant-specific IPN authentication and key format remain unverified. The authenticated reconciliation route provides a server-side polling path.
