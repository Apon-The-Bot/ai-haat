# AI HAAT — ORDERS, PAYMENTS & DIGITAL ENTITLEMENTS
**Document ID:** REPORT-07  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Order lifecycle, payment gateway reconciliation, digital goods fulfillment, secret masking, and the Audited Credential Reveal Protocol.

---

## 1. Executive Summary

AI Haat is a specialized marketplace for digital goods, software licenses, AI tool subscriptions, and developer assets. The Orders & Entitlements subsystem manages order processing, multi-channel payment reconciliation (bKash, Nagad, Cards, Wallet), and secure digital key fulfillment. High-value credentials and license keys are protected by cryptographic masking and a strict, audited administrative reveal protocol.

---

## 2. Order Lifecycle & Status Progression

```
             ┌─────────────────────────┐
             │       ORDER CREATED     │ (Status: PENDING)
             └────────────┬────────────┘
                          │ Payment Initiated
                          ▼
             ┌─────────────────────────┐
             │   PAYMENT PROCESSING    │ (Gateway Webhook / Manual Verification)
             └──────┬───────────┬──────┘
       Success      │           │ Failure / Timeout
       ┌────────────┘           └────────────┐
       ▼                                     ▼
┌──────────────┐                       ┌──────────────┐
│  COMPLETED   │                       │  CANCELLED   │
└──────┬───────┘                       └──────────────┘
       │
       │ Admin Action / Dispute
       ▼
┌──────────────┐
│   REFUNDED   │
└──────────────┘
```

### 2.1 Order State Rules
- **`PENDING`:** Order record created, awaiting payment gateway confirmation or manual payment screenshot submission.
- **`COMPLETED`:** Funds captured and verified. Automated digital delivery trigger executes instantly: software keys, download links, or accounts are provisioned to the customer's vault.
- **`CANCELLED`:** Payment expired or discarded. Entitlements are revoked immediately.
- **`REFUNDED`:** Funds returned (either back to payment source or credited to customer's wallet balance). Any associated license keys are invalidated.

---

## 3. Digital Asset Fulfillment & Vault

When an order reaches `COMPLETED`, the platform provisions digital assets into `DigitalDeliveryItem`:
- **Asset Types:**
  1. **License Keys / Activation Codes:** Single-use alphanumeric strings (e.g. JetBrains, Windows, Office, SaaS activation tokens).
  2. **Account Credentials:** Username/Password combinations for curated AI subscriptions (e.g. ChatGPT Team, Midjourney seats).
  3. **Direct File Downloads:** Protected signed URLs for digital assets with download count quotas.

---

## 4. The Audited Credential Reveal Protocol

To protect customer secrets and proprietary digital inventory against staff exfiltration or accidental exposure, all credentials in the Admin 360° Console are masked by default.

```
       Admin views Digital Vault in 360° Console
                          │
                          ▼
           Credential displayed as:
           [ ****************-1A2B ]  [ Reveal Key ]
                          │
                          ▼ Click "Reveal Key"
         Prompt Admin for Justification Reason
         (e.g. "Customer opened ticket #942 reporting activation error")
                          │
                          ▼ Admin Submits Justification
         POST /api/admin/users/[id]/reveal-credential
         {
           "deliveryItemId": "cuid_xyz",
           "reason": "Resolving ticket #942"
         }
                          │
                          ▼ Server-Side Verification
         1. Verify Admin is authenticated (ADMIN or SUPER_ADMIN)
         2. Validate reason string (min 5 chars)
         3. Fetch unmasked secret from DigitalDeliveryItem
         4. Write immutable audit record:
            AdminAuditLog.create({
              action: "CREDENTIAL_REVEALED_BY_ADMIN",
              resourceId: deliveryItemId,
              details: { userId, reason, adminEmail }
            })
                          │
                          ▼
         Return unmasked secret to client modal for 60 seconds
```

### 4.1 Zero-Leakage Guarantee
- The unmasked key is returned **only** in the direct HTTP response to the authorized staff member's ephemeral session.
- System loggers, application stdout, and database audit tables **never** write the raw decrypted key into audit trails. Only the reference ID and event metadata are recorded.

---

## 5. Administrative Refund & Resend Controls

From `/admin/users/[id]`, administrators have direct controls to:
1. **Resend Digital Delivery:** Re-trigger email and in-app notifications containing delivery information if a customer reports non-receipt.
2. **Issue In-Store Wallet Refund:** Credit the exact order amount in BDT directly to the customer's wallet balance, logging the reversal in both the order record and the financial ledger.
3. **Revoke Entitlement:** Mark an activation key as deactivated in case of fraudulent disputes or chargebacks.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
