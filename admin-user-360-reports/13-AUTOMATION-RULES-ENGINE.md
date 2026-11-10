# AI HAAT — AUTOMATION RULES ENGINE SPECIFICATION
**Document ID:** REPORT-13  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Automated operational policies, event triggers, condition evaluation, automated actions, and execution audit trails.

---

## 1. Executive Summary

The AI Haat Automation Rules Engine (`src/lib/user-control/automation-rules-service.ts`) automates repetitive operational, security, and customer lifecycle tasks. By continuously evaluating real-time events against configurable system rules, the engine mitigates fraud, expires temporary administrative restrictions, rewards high-value customers, and auto-escalates delivery errors without manual intervention.

---

## 2. Standardized Enterprise Rules Catalog

The platform defines 5 core system rules covering security, lifecycle, fraud, commercial growth, and fulfillment:

| Rule Identifier | Domain | Event Trigger | Evaluation Condition | Automated Action |
| :--- | :--- | :--- | :--- | :--- |
| **`RULE_FAIL_LOGINS_ALERT`** | Security | `AUTHENTICATION` | $\ge 5$ failed logins within 15 minutes. | Alerts admin audit log; sets risk to `HIGH`; triggers user alert. |
| **`RULE_RESTRICTION_EXPIRY_CLEANUP`**| Lifecycle | Scheduled Cron / Hourly | Active status or restriction `expiresAt < NOW()`. | Automatically cleans up expired restrictions; restores `ACTIVE` status. |
| **`RULE_DATACENTER_PROXY_FLAG`** | Fraud | Network Observation | Client IP is marked `isProxy: true` (datacenter/VPN). | Attaches `Proxy User` tag; logs warning in activity log. |
| **`RULE_HIGH_VALUE_VIP_TAG`** | Commercial | Order Completed | Cumulative completed spend $\ge 25,000\text{ BDT}$. | Attaches `VIP Customer` tag; sends congratulatory notice. |
| **`RULE_FAILED_DELIVERY_INCIDENT`** | Fulfillment | Digital Delivery | License key exhausted or delivery marked `FAILED`. | Generates urgent support ticket; alerts ops staff. |

---

## 3. Rule Execution Mechanics

```
               Incoming Platform Event / Scheduled Trigger
                                   │
                                   ▼
                   Identify Matching Active Rules
                   (e.g. RULE_RESTRICTION_EXPIRY_CLEANUP)
                                   │
                                   ▼
                   Evaluate Conditional Logic
                   - Is rule enabled? (enabled === true)
                   - Do conditions match target payload?
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                      MATCH                NO MATCH
                        │                     │
                        ▼                     ▼
              Execute Rule Actions       Exit Cleanly
              1. Mutate Database State
              2. Append to AdminAuditLog
              3. Dispatch Notifications
```

### 3.1 Rule 1: Failed Logins Anomaly Alert (`RULE_FAIL_LOGINS_ALERT`)
```typescript
if (failedLoginCount >= 5) {
  await logAdminAction({
    action: 'SECURITY_ALERT_TRIGGERED',
    resource: 'User',
    resourceId: userId,
    details: { ruleId: 'RULE_FAIL_LOGINS_ALERT', failureCount: failedLoginCount, windowMinutes: 15 },
  });
}
```

### 3.2 Rule 2: Automatic Expiry Cleanup (`RULE_RESTRICTION_EXPIRY_CLEANUP`)
- Periodically queries `user_status_records` and `user_restrictions` where `expiresAt` is in the past.
- Automatically restores accounts to `ACTIVE` and removes lapsed feature restrictions, logging `RESTRICTION_EXPIRED_CLEANUP` in `AdminAuditLog` with `adminId: "system"`.

### 3.3 Rule 3: Datacenter / Proxy Flagging (`RULE_DATACENTER_PROXY_FLAG`)
- Ingested IP intelligence is checked against known hosting provider ASNs (Amazon, DigitalOcean, Hetzner, etc.).
- When `isProxy: true`, tags the account with `Proxy User` to alert fraud analysts during manual checkout reviews.

### 3.4 Rule 4: High-Value Customer VIP Tagging (`RULE_HIGH_VALUE_VIP_TAG`)
- Computes aggregate completed order spend.
- Once the threshold ($25,000\text{ BDT}$) is met, auto-applies the `VIP Customer` tag, unlocking priority support queuing.

### 3.5 Rule 5: Failed Digital Delivery Escalation (`RULE_FAILED_DELIVERY_INCIDENT`)
- If digital stock inventory is empty when a customer pays for an automated key, fulfillment cannot complete.
- Immediately creates a `SupportTicket` with priority `URGENT` assigned to the inventory manager, notifying the team before the customer complains.

---

## 4. Execution Logging & Manual Overrides

1. **Auditability:** Every rule execution records its inputs, evaluation timestamp, and state delta in `AdminAuditLog` with `adminId: "system_automation"`.
2. **Administrative Override:** Administrators can disable or re-enable individual automation rules at any time via system settings without modifying codebase logic.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
