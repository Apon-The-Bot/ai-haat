# Hybrid fulfillment QA report

Added isolated checks for global/manual defaults, variant automatic override, automatic supplier capability filtering, emergency stop, no-auto-capability escalation, and purchase-limit fallback. These checks are DB/network-free. Full external supplier purchase, concurrency, reconciliation, and mixed-order end-to-end tests remain blocked until verified order APIs and durable fulfillment-attempt persistence are available.
