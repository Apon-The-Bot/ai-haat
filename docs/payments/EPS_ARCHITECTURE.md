# EPS architecture

Checkout and wallet use the same payment initiation route. EPS creates a durable payment attempt before requesting a hosted checkout. Browser return, Admin Check EPS, and an authenticated cron route query the EPS status API. Matched payments flow into transactional order or wallet finalization. Legacy callback and webhook remain available while older payments are outstanding.
