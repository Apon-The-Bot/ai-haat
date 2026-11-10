# AI HAAT — SECURITY & FRAUD INTELLIGENCE ENGINE
**Document ID:** REPORT-10  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Automated anomaly detection, threat indicators, risk scoring taxonomy (`LOW`, `MEDIUM`, `HIGH`), and automated defensive quarantine.

---

## 1. Executive Summary

The AI Haat Security and Fraud Intelligence Engine monitors real-time user behavior, login patterns, and network signals to identify malicious actors, compromised accounts, and payment fraud. By combining heuristic indicators with automated quarantine rules, the system minimizes merchant risk while preventing disruption to legitimate customers.

---

## 2. Risk Scoring & Threat Level Taxonomy

Every customer account is assigned a dynamic risk profile evaluated during authentication, high-value checkouts, and profile mutations:

```
                    ┌───────────────────────────────┐
                    │     Live Telemetry Stream     │
                    │  (Logins, IPs, Orders, GPS)   │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │ Anomaly Evaluation Engine   │
                     │ (Failed Logins, Proxy, Geo) │
                     └──────────────┬──────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
  ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
  │   LOW RISK   │           │ MEDIUM RISK  │           │  HIGH RISK   │
  │  (Score 0-2) │           │ (Score 3-6)  │           │ (Score 7-10) │
  └──────┬───────┘           └──────┬───────┘           └──────┬───────┘
         │                          │                          │
         ▼                          ▼                          ▼
   Full Access               Warning Flagged            Automatic Action:
   Standard Limits           Step-up 2FA Challenge      - Account Quarantine
                             Staff Review Triggered     - Wallet Restrictions
```

### 2.1 Threat Levels Defined

| Level | Anomaly Score | Typical Trigger Conditions | Automated Platform Response |
| :--- | :--- | :--- | :--- |
| **`LOW`** | 0 – 2 | Known device, residential ISP, consistent country, normal checkout velocity. | Normal frictionless operation. |
| **`MEDIUM`** | 3 – 6 | New device instance, commercial VPN/proxy IP, or 3 failed logins in 1 hour. | Enforces 2FA challenge; notifies user via email; flags profile in Admin Dashboard. |
| **`HIGH`** | 7 – 10 | 5+ consecutive failed logins, impossible travel (>500 km in 30 min), or rapid carding attempts. | Quarantine triggered: temporary suspension or `SHOPPING_PURCHASE` disabled; all active sessions revoked. |

---

## 3. Core Threat Detection Heuristics

### 3.1 Credential Stuffing & Brute Force Defense
- **Indicator:** Multiple failed login attempts within a narrow time window.
- **Trigger Rule (`RULE_FAIL_LOGINS_ALERT`):** $\ge 5$ failed authentication events within a rolling 15-minute window for a single account.
- **Action:** Generates an immediate security alert in `AdminAuditLog`, increments account risk score to `HIGH`, and temporary rate-limits login attempts from that IP.

### 3.2 Datacenter & Anonymizing Proxy Detection
- **Indicator:** Connection originating from hosting providers (AWS, Hetzner, DigitalOcean) rather than residential consumer ISPs (Grameenphone, Banglalink, Comcast).
- **Trigger Rule (`RULE_DATACENTER_PROXY_FLAG`):** Network observation records `isProxy: true`.
- **Action:** Tags profile with `Proxy User`, flags risk score as `MEDIUM`, and enforces SMS/Email OTP verification on high-value checkouts.

### 3.3 Impossible Travel (Velocity Anomalies)
- **Indicator:** Geolocation observations indicating physical movement at supersonic speeds (e.g. login from Dhaka, Bangladesh followed 20 minutes later by login from Frankfurt, Germany).
- **Action:** Triggers session invalidation on the older session, requires password reset, and flags account for staff review.

### 3.4 Rapid Wallet Draining & High-Velocity Purchases
- **Indicator:** Repeated high-value digital orders placed within seconds of a wallet deposit or account takeover.
- **Action:** Puts order in `MANUAL_REVIEW` status; restricts `DIGITAL_DOWNLOADS` and `LICENSE_KEYS` until staff clearance.

---

## 4. Fraud Investigation Console in 360° Profile

Inside `/admin/users/[id]`, the **Security & Fraud** panel provides investigators with:
1. **Interactive Incident Feed:** Chronological breakdown of failed logins, password changes, and risk level transitions.
2. **Device History Comparison:** Side-by-side analysis of the suspect device instance vs known trusted devices.
3. **One-Click Mitigations:**
   - "Quarantine Account" (instantly sets `SUSPENDED` with reason "Security Quarantine").
   - "Reset Password & Expire Sessions" (sends secure password reset link and revokes all sessions).
   - "Clear Fraud Flag" (restores account to `LOW` risk once verified).

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
