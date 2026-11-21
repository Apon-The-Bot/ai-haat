# Notification architecture

The existing `NotificationEvent` outbox, dedupe key, delivery records, retry logic, in-app, email, and Telegram channels are the notification foundation. Supplier automation must publish domain events through this outbox and remain idempotent.
