# Order fulfillment

Existing fulfillment handlers support stock, manual, and protected-download flows with idempotency. No supplier purchase handler is enabled; adding one requires a durable job/outbox, idempotency key, timeout/retry policy, compensation path, and explicit order-state transitions.
