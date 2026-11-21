# Payment migration inventory

## Initiation and verification

- Standard checkout, Quick Checkout, and both wallet top-up pages call `POST /api/payment/create`. The EPS flag selects the provider for new gateway attempts. Internal wallet balance payments use the existing order flow.
- `/api/payment/callback` and `/api/payment/webhook` contain PipraPay-specific verification and remain available for outstanding legacy payments.
- EPS creates a durable attempt before making the provider request. Its return page, admin action, and authenticated reconciliation endpoint use the EPS status API. Provider data is matched against the recorded customer, attempt, and amount before order or wallet finalization.
- `/api/admin/gateways` manages the legacy gateway configuration. `/admin/eps-payments` displays EPS configuration presence and attempt reconciliation.

## Records and shared services

Preserve `Order`, `OrderItem`, `WalletTransaction`, `Refund`, `OrderTimelineEvent`, and `NotificationEvent` records. The additive `EpsPaymentAttempt` table keeps EPS references and verification state. Existing wallet ledger, inventory fulfillment, notifications, analytics, affiliate commission, and loyalty services remain part of the paid-order flow.

## Legacy configuration and retirement

Legacy keys include `PIPRAPAY_BASE_URL`, `PIPRAPAY_API_KEY`, `PIPRAPAY_MERCHANT_ID`, and `PIPRAPAY_DATABASE_URL`. Keep required legacy settings while outstanding transactions or historical reconciliation depend on them. Legacy scripts under `scripts/` include gateway setup, remote upload, direct verification, and database inspection. Review their operational use before removing them.

Before retirement, verify the EPS migration on isolated MySQL, complete sandbox order and wallet payments, verify refunds and settlement handling, compare EPS and legacy reconciliation results, and confirm there are no outstanding legacy transactions that still require the callbacks.
