# AI HAAT — PRIVACY, CONSENT & DATA RETENTION SPECIFICATION
**Document ID:** REPORT-15  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Regulatory compliance, the affirmative Consent Ledger, automated data retention pruning schedules, and PII anonymization procedures.

---

## 1. Executive Summary

AI Haat is committed to rigorous data protection standards that respect customer privacy and comply with international regulations (GDPR, CCPA) and regional data privacy frameworks. The platform enforces an affirmative consent ledger, automated time-bounded data retention pruning, and privacy-preserving account anonymization that maintains financial ledger auditability.

---

## 2. The Affirmative Privacy Consent Ledger (`user_consent_records`)

Under modern privacy standards, processing sensitive personal telemetry (such as high-accuracy GPS coordinates or marketing communications) requires freely given, specific, and unambiguous consent.

```sql
CREATE TABLE `user_consent_records` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `consentType` VARCHAR(50) NOT NULL,
  `isGranted` BOOLEAN NOT NULL DEFAULT FALSE,
  `ipAddress` VARCHAR(100) NULL,
  `userAgent` VARCHAR(255) NULL,
  `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revokedAt` DATETIME(3) NULL,
  INDEX `idx_user_consent_user_type` (`userId`, `consentType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.1 Consent Categories & Rules:

| Consent Key | Scope | Legal Basis | Ingestion Policy |
| :--- | :--- | :--- | :--- |
| **`LOCATION_GPS`** | High-precision browser geolocation coordinates. | Explicit Consent | If revoked, GPS coordinates are rejected and dropped immediately. |
| **`ANALYTICS_COOKIES`** | Performance telemetry and Core Web Vitals monitoring. | Consent | If revoked, Web Vitals telemetry ingestion is bypassed. |
| **`MARKETING_EMAIL`** | Promotional newsletters, discounts, product updates. | Opt-In / Consent | If revoked, user is excluded from marketing broadcast segments. |

### 2.2 Proof of Consent Auditability
Every consent grant or revocation captures the user's IP address and User-Agent string at the exact millisecond of affirmative action, providing legally defensible compliance evidence.

---

## 3. Time-Bounded Data Retention & Automated Pruning

To avoid indefinite accumulation of sensitive environmental data, AI Haat enforces strict data lifecycle schedules:

```
Telemetry / Log Category      Retention Window    Pruning Schedule      Pruning Action
────────────────────────────────────────────────────────────────────────────────────────────
Technical Observations        90 Days             Daily Cron            DELETE records > 90d
Device Instances              180 Days            Weekly Cron           DELETE inactive > 180d
User Activity Logs            365 Days            Monthly Cron          Archive to cold storage
Customer Orders & Financials  Permanent (7 Yrs)   Never Pruned          Immutable financial law
Consent Records               Permanent           Never Pruned          Proof of legal compliance
```

### 3.1 Automated Pruning Query (Cron Task)
```sql
-- Prune raw network observations older than 90 days
DELETE FROM `user_technical_observations` 
WHERE `createdAt` < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Prune inactive client instances not seen in 180 days
DELETE FROM `user_device_instances`
WHERE `lastSeenAt` < DATE_SUB(NOW(), INTERVAL 180 DAY);
```

---

## 4. Right to be Forgotten & PII Anonymization

When a customer exercises their right to account deletion or deactivation:
1. **Financial Integrity Preservation:** Orders, invoices, and double-entry wallet transactions cannot be deleted due to commercial tax and anti-money laundering (AML) laws.
2. **PII Scrubbing:**
   - The user's `name` is replaced with `Anonymized Customer [cuid]`.
   - The `email` is replaced with `deleted_[cuid]@anonymized.aihaat.shop`.
   - Stored phone numbers, billing addresses, and avatars are permanently deleted.
   - All client device instances and technical observations are wiped.
   - Status transitions to `DEACTIVATED`.
   - All active sessions are terminated.
3. This completely breaks the link between the real person and the platform, while leaving historical financial totals balanced for tax audits.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
