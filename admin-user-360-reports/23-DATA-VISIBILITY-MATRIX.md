# AI HAAT — DATA VISIBILITY & ACCESS MATRIX
**Document ID:** REPORT-23  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Comprehensive mapping of every user data element to administrative UI views, roles, and masking transformations.

---

## 1. Executive Summary

The AI Haat Data Visibility Matrix enforces the principle of least privilege across the administrative surface. Different staff tiers require varying degrees of data access to perform their duties; this matrix dictates exactly where each attribute appears and what redaction or masking transformations are applied before rendering.

---

## 2. Comprehensive Data Visibility Matrix

| Data Entity & Field | Classification | Admin 360 Location | `SUPER_ADMIN` | `ADMIN` | `SUPPORT` / `ANALYST` | Transformation / Masking Rule |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **`User.id` (CUID)** | INTERNAL | Header Banner | Full | Full | Full | Unmasked plain text |
| **`User.name`** | CONFIDENTIAL | Header Banner & Profile | Full | Full | Full | Unmasked plain text |
| **`User.email`** | CONFIDENTIAL | Header & Profile Tab | Full | Full | Full | Unmasked plain text |
| **`User.password`** | RESTRICTED | Not Displayed in UI | Hidden | Hidden | Hidden | One-way hash; never rendered |
| **`User.role`** | INTERNAL | Header Badge | Full | Full | Read-Only | Colored badge |
| **`User.walletBalance`**| CONFIDENTIAL | Financial Summary Cards | Full | Full | Read-Only | Formatted BDT currency |
| **`user_status_records.status`**| CONFIDENTIAL | Status Control & Badges | Full | Full | Read-Only | Colored status badge |
| **`user_status_records.reason`**| CONFIDENTIAL | Status History Drawer | Full | Full | Full | Text string |
| **`user_restrictions.featureKey`**| INTERNAL | Restrictions Table | Full | Full | Read-Only | Feature badge |
| **`DigitalDeliveryItem.licenseKey`**| RESTRICTED | Section 6: Digital Vault | Masked -> Reveal | Masked -> Reveal | Masked (No Reveal) | `XXXX-XXXX-XXXX-1A2B`; Audited reveal required |
| **`DigitalDeliveryItem.password`**| RESTRICTED | Section 6: Digital Vault | Masked -> Reveal | Masked -> Reveal | Masked (No Reveal) | Audited reveal required |
| **`user_technical_observations.ipAddress`**| CONFIDENTIAL | Intelligence: IP Tab | Full IP | Full IP | Masked IP | Masked: `103.145.***.***` for Support |
| **`user_technical_observations.isp`**| INTERNAL | Intelligence: IP Tab | Full | Full | Full | Plain text (e.g. Grameenphone) |
| **`user_technical_observations.asn`**| INTERNAL | Intelligence: IP Tab | Full | Full | Full | Plain text (e.g. AS24389) |
| **`user_technical_observations.country`**| INTERNAL | Intelligence: Location | Full | Full | Full | Flag & Country name |
| **`user_technical_observations.city`**| INTERNAL | Intelligence: Location | Full | Full | Full | City name |
| **`user_technical_observations.latitude/lon`**| CONFIDENTIAL | Intelligence: Location | Full | Full | Redacted (City only)| GPS displayed only with consent |
| **`user_device_instances.instanceId`**| INTERNAL | Intelligence: Devices | Full | Full | Full | `dev_instance_...` |
| **`user_device_instances.browser/os`**| INTERNAL | Intelligence: Devices | Full | Full | Full | Formatted browser/OS string |
| **`user_admin_notes.content`**| CONFIDENTIAL | Section 14: Staff Notes | Full | Full | Full | Internal only; never in customer API |
| **`user_tags.tag`** | INTERNAL | Header & Tags Section | Full | Full | Full | Colored tag pills |
| **`AdminAuditLog.details`**| INTERNAL | Section 18: Audit Trail | Full | Full | Read-Only | JSON inspector tree |

---

## 3. Enforcement Mechanisms

1. **API Perimeter Redaction:** Fields classified as `RESTRICTED` or `CONFIDENTIAL` (such as raw IP addresses or license keys) are sanitized in the API route handler before JSON serialization based on the requesting user's session role.
2. **Client Component Safeguards:** The `UserIntelligencePanel` component dynamically renders redacted placeholders when receiving masked payloads, ensuring no client-side DOM inspection can expose protected PII.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
