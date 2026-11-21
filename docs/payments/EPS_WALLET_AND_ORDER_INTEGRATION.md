# EPS wallet and order integration

Wallet finalization reuses the existing idempotent ledger and transaction key. Order finalization atomically records payment, attempt state, and timeline. A verified payment for an already paid or otherwise non-payable order is retained for review. Isolated MySQL tests with provider fixtures verified one credit and one order transition under repeated requests.
