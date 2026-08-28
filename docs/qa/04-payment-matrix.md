# 04 — Payment, Webhook Idempotency & Race Matrix

## 1. Provider Verification & Idempotency Scenarios

| Test Case | Scenario / Payload | Expected System Action | Financial / Delivery Invariant |
| :--- | :--- | :--- | :--- |
| **PAY-01** | Fake Success Callback (Forged status) | Verify via server-to-server API check. Status remains `PENDING`. | No auto-delivery; no order verification without provider confirmation. |
| **PAY-02** | Wrong Amount Callback (Order = ৳500, Callback = ৳100) | Verification fails due to amount mismatch. | Order marked `FAILED` or remains `PENDING`. |
| **PAY-03** | Wrong Currency (Order = BDT, Callback = USD) | Verification fails due to currency mismatch. | Rejected. |
| **PAY-04** | Duplicate Webhook Replay (Same webhook sent 10x) | Processed idempotently; order verified once; single delivery triggered. | Zero duplicate keys delivered; zero double wallet top-ups. |
| **PAY-05** | Callback & Webhook Race Condition | Both callback and webhook arrive within 5ms. | Transactional atomic update transitions state once. |
| **PAY-06** | Transaction ID Reuse | Second distinct order submits same `trxId` already verified on Order 1. | Rejected as duplicate transaction. |
| **PAY-07** | Late Webhook | Webhook arrives 3 hours after order creation. | Order verified and delivered normally. |
| **PAY-08** | Browser Closed After Payment | Customer closes tab before callback URL is loaded. | Background webhook processes payment and delivers credentials to Vault. |
