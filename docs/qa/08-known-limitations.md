# 08 — Known Limitations & Environment Contracts

## 1. Testing Limitations
1. **Live Payment Provider Sandbox**: Live bKash/Nagad automated gateway webhooks are tested via local mock boundary simulation.
2. **Third-Party Email SMTP**: Actual email delivery is tested using standard nodemailer test transports and SMTP mock validation to prevent sending emails to actual customers during automated runs.
3. **Telegram Webhooks**: Outgoing Telegram notifications are intercepted and validated against credential redaction rules without spamming live production admin channels.

---

## 2. Environment Contracts
* **Database Isolation**: The test runner enforces safety verification against database URLs to ensure test execution uses non-destructive synthetic fixtures.
* **Clock Manipulation**: Time-dependent tests for warranty expiration and coupon validity use synthetic timestamps in database records.
