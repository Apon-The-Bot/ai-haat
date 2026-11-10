# AI HAAT — COMPLETE USER DATA DICTIONARY
**Document ID:** REPORT-02  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Complete taxonomy of all user data fields, sources, data classifications, retention periods, and sensitivity levels.

---

## 1. Executive Summary

This User Data Dictionary defines the canonical taxonomy for all user-related data stored, processed, and displayed across the AI Haat enterprise platform. In compliance with strict zero-covert-fingerprinting standards, privacy regulations, and audit requirements, every attribute is classified by data category, sensitivity, storage engine, update frequency, retention schedule, and authorization scope.

---

## 2. Data Classification Standards

| Classification | Definition | Security Controls | Access Control |
| :--- | :--- | :--- | :--- |
| **PUBLIC** | Information intended for public display (e.g. public username, avatar URL). | Transport layer security (TLS 1.3). | Public / Any authenticated user. |
| **INTERNAL** | Platform operational data (e.g. user ID, role, creation timestamp, order counts). | Database encryption at rest, TLS 1.3. | Authenticated staff (SUPPORT, ADMIN, SUPER_ADMIN). |
| **CONFIDENTIAL** | Personal Identifiable Information (PII) & financials (e.g. email, phone, wallet balance, IP addresses). | Encrypted at rest, field-level role-based masking. | ADMIN, SUPER_ADMIN; masked for SUPPORT/ANALYST. |
| **RESTRICTED / SECRET** | High-risk credentials & secrets (e.g. password hash, license keys, secret tokens). | Argon2/Bcrypt hash, encrypted credentials, masked in UI, audited reveals. | SUPER_ADMIN only with audited justification; never plaintext in logs. |

---

## 3. Comprehensive Data Dictionary by Entity

### 3.1 Primary Identity & Profile (`User`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Immutable unique identifier for the user account. | Permanent |
| `name` | `String?` | CONFIDENTIAL | User Registration / SSO | Full display name of the customer. | Account lifetime + 7 yrs |
| `email` | `String?` | CONFIDENTIAL | User Input / SSO | Primary email address, unique index, used for authentication & notifications. | Account lifetime + 7 yrs |
| `emailVerified` | `DateTime?` | INTERNAL | Verification Service | Timestamp when email verification was completed via link/OTP. | Account lifetime |
| `image` | `String?` | PUBLIC | User Upload / SSO | Public avatar URL pointing to secure CDN storage. | Account lifetime |
| `password` | `String?` | RESTRICTED | User Input (Hashed) | Bcrypt/Argon2 one-way hash with unique salt. Plaintext is never stored. | Overwritten on reset |
| `role` | `Role` (Enum) | INTERNAL | Admin Assignment | Access tier: `USER`, `RESELLER`, `ADMIN`. Dictates system privileges. | Permanent |
| `walletBalance` | `Float` | CONFIDENTIAL | Ledger Transactions | Current available spending balance in BDT. Driven by double-entry ledger. | Permanent |
| `twoFactorEnabled` | `Boolean` | INTERNAL | User Security Settings | Flag indicating if 2FA/TOTP is enforced on login. | Account lifetime |
| `twoFactorSecret` | `String?` | RESTRICTED | 2FA Setup | AES-256 encrypted TOTP shared secret. | Account lifetime |
| `createdAt` | `DateTime` | INTERNAL | System Generated | Account registration timestamp. | Permanent |
| `updatedAt` | `DateTime` | INTERNAL | System Generated | Timestamp of last user record modification. | Permanent |

---

### 3.2 Account Status & Lifecycle Records (`user_status_records`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Unique record ID. | Permanent |
| `userId` | `String` (cuid) | INTERNAL | Foreign Key -> User | The subject user account. | Permanent |
| `status` | `String` (Enum) | CONFIDENTIAL | Admin Action / Automation | State: `ACTIVE`, `SUSPENDED`, `BANNED`, `PENDING_VERIFICATION`, `DEACTIVATED`. | Permanent |
| `reason` | `String` | CONFIDENTIAL | Admin Input / Rule Trigger | Mandatory human-readable justification for the status change. | Permanent |
| `adminId` | `String?` | CONFIDENTIAL | Auth Session | ID of staff member executing change, or `system` for automation. | Permanent |
| `adminEmail` | `String?` | CONFIDENTIAL | Auth Session | Email of staff member executing change. | Permanent |
| `expiresAt` | `DateTime?` | INTERNAL | Admin Input | Scheduled expiration timestamp for temporary suspensions. | Permanent |
| `createdAt` | `DateTime` | INTERNAL | System Generated | Timestamp when status was enacted. | Permanent |

---

### 3.3 Feature Restrictions & Quotas (`user_restrictions`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Unique restriction identifier. | Permanent |
| `userId` | `String` (cuid) | INTERNAL | Foreign Key -> User | Targeted customer account. | Permanent |
| `featureKey` | `String` | INTERNAL | Admin Selection | Target feature key from the 23-feature registry (e.g. `SHOPPING_PURCHASE`). | Permanent |
| `restrictionType`| `String` (Enum) | INTERNAL | Admin Selection | `DISABLED` (hard block), `READ_ONLY` (read access only), `LIMIT_USAGE` (capped).| Permanent |
| `limitValue` | `Float?` | INTERNAL | Admin Input | Numeric threshold (e.g. 5000 BDT max spending or 10 downloads/day). | Permanent |
| `reason` | `String` | CONFIDENTIAL | Admin Input | Mandatory operational justification for the restriction. | Permanent |
| `adminId` | `String` | CONFIDENTIAL | Auth Session | Staff member ID placing the restriction. | Permanent |
| `adminEmail` | `String` | CONFIDENTIAL | Auth Session | Staff member email placing the restriction. | Permanent |
| `expiresAt` | `DateTime?` | INTERNAL | Admin Input | Expiry date/time when restriction automatically lapses. | Permanent |
| `createdAt` | `DateTime` | INTERNAL | System Generated | Creation timestamp. | Permanent |

---

### 3.4 Device Telemetry & Client Environment (`user_device_instances`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Database primary key. | 180 Days |
| `userId` | `String` (cuid) | INTERNAL | Foreign Key -> User | Target user identity. | 180 Days |
| `instanceId` | `String` | CONFIDENTIAL | Random UUID in Storage | Fingerprint-free random client instance identifier (`dev_instance_...`). | 180 Days |
| `deviceName` | `String?` | INTERNAL | User Agent Parser | Friendly device name (e.g. "Apple iPhone 14", "Dell XPS 15"). | 180 Days |
| `deviceType` | `String?` | INTERNAL | User Agent Parser | Category: `DESKTOP`, `MOBILE`, `TABLET`, `BOT`, `UNKNOWN`. | 180 Days |
| `browser` | `String?` | INTERNAL | User Agent Parser | Client browser family & major version (e.g. "Chrome 128.0"). | 180 Days |
| `os` | `String?` | INTERNAL | User Agent Parser | Operating system & version (e.g. "Windows 11", "iOS 17.4"). | 180 Days |
| `platform` | `String?` | INTERNAL | Navigator Client Hint | Architecture / Platform string (`Win32`, `Linux x86_64`). | 180 Days |
| `screenResolution`| `String?` | INTERNAL | Window DOM Dimensions | Screen width x height (e.g. "1920x1080"). | 180 Days |
| `isTrusted` | `Boolean` | INTERNAL | Admin Evaluation | Flag indicating whether administrator has marked device as trusted. | 180 Days |
| `firstSeenAt` | `DateTime` | INTERNAL | Ingestion Service | First recorded interaction from this device instance. | 180 Days |
| `lastSeenAt` | `DateTime` | INTERNAL | Ingestion Service | Most recent interaction timestamp. | 180 Days |

---

### 3.5 Network & Geolocation Telemetry (`user_technical_observations`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Unique observation identifier. | 90 Days |
| `userId` | `String` (cuid) | INTERNAL | Foreign Key -> User | Targeted customer account. | 90 Days |
| `ipAddress` | `String` | CONFIDENTIAL | Reverse Proxy Headers | Client IP address (`CF-Connecting-IP`, `X-Forwarded-For`). Masked in UI. | 90 Days |
| `ipType` | `String` | INTERNAL | IP Intelligence | Protocol version: `IPv4` or `IPv6`. | 90 Days |
| `isp` | `String?` | INTERNAL | IP Intelligence | Internet Service Provider (e.g. "Grameenphone", "Comcast"). | 90 Days |
| `asn` | `String?` | INTERNAL | IP Intelligence | Autonomous System Number (e.g. "AS24389"). | 90 Days |
| `isProxy` | `Boolean` | CONFIDENTIAL | IP Threat Intelligence | Flag indicating datacenter IP, commercial VPN, or public proxy. | 90 Days |
| `country` | `String?` | INTERNAL | GeoIP Lookup | Two-letter ISO country code (e.g. "BD", "US"). | 90 Days |
| `city` | `String?` | INTERNAL | GeoIP Lookup | Approximate city resolved from IP geolocation. | 90 Days |
| `latitude` | `Float?` | CONFIDENTIAL | GPS / GeoIP | Approximate IP latitude or high-precision GPS (requires consent). | 90 Days |
| `longitude` | `Float?` | CONFIDENTIAL | GPS / GeoIP | Approximate IP longitude or high-precision GPS (requires consent). | 90 Days |
| `locationSource`| `String` (Enum) | INTERNAL | Telemetry Engine | Source: `IP_APPROXIMATE` or `GPS_CONSENTED`. | 90 Days |
| `webVitals` | `Json?` | INTERNAL | Client Performance API | Bounded Core Web Vitals telemetry (`{ lcp, fid, cls, ttfb }`). | 90 Days |
| `createdAt` | `DateTime` | INTERNAL | Ingestion Service | Timestamp of technical observation. | 90 Days |

---

### 3.6 Privacy & Regulatory Consent Ledger (`user_consent_records`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Unique consent ledger entry ID. | Permanent |
| `userId` | `String` (cuid) | INTERNAL | Foreign Key -> User | Associated customer. | Permanent |
| `consentType` | `String` (Enum) | CONFIDENTIAL | User Action | Category: `LOCATION_GPS`, `ANALYTICS_COOKIES`, `MARKETING_EMAIL`. | Permanent |
| `isGranted` | `Boolean` | CONFIDENTIAL | User Action | Status: `true` (opted-in) or `false` (revoked). | Permanent |
| `ipAddress` | `String?` | CONFIDENTIAL | Request Header | Proof of origin IP at the moment of consent grant/revocation. | Permanent |
| `userAgent` | `String?` | INTERNAL | Request Header | Client User-Agent string recorded for regulatory auditability. | Permanent |
| `grantedAt` | `DateTime` | INTERNAL | System Generated | Timestamp when affirmative action was recorded. | Permanent |
| `revokedAt` | `DateTime?` | INTERNAL | System Generated | Timestamp when user withdrew consent. | Permanent |

---

### 3.7 Internal Staff Collaboration Notes (`user_admin_notes`)

| Field Name | Type | Sensitivity | Source | Description & Business Rules | Retention |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `String` (cuid) | INTERNAL | System Generated | Unique note record identifier. | Permanent |
| `userId` | `String` (cuid) | INTERNAL | Foreign Key -> User | Customer account being referenced. | Permanent |
| `authorId` | `String` | CONFIDENTIAL | Auth Session | Admin staff member ID who created the note. | Permanent |
| `authorName` | `String` | CONFIDENTIAL | Auth Session | Staff member display name. | Permanent |
| `authorEmail`| `String` | CONFIDENTIAL | Auth Session | Staff member email. | Permanent |
| `content` | `String` (Text) | CONFIDENTIAL | Admin Input | Internal note content. Strictly never exposed to end-users. | Permanent |
| `category` | `String` (Enum) | INTERNAL | Admin Selection | `GENERAL`, `SUPPORT`, `FRAUD_RISK`, `FINANCIAL`, `VERIFICATION`. | Permanent |
| `isPinned` | `Boolean` | INTERNAL | Admin Selection | Flag indicating high-priority note pinned to top of 360 profile. | Permanent |
| `createdAt` | `DateTime` | INTERNAL | System Generated | Note creation timestamp. | Permanent |

---

## 4. Sensitive Credential Exposure Policies

1. **User Passwords:** Stored only as salted cryptographic hashes. No interface, API, or staff member can view plaintext passwords.
2. **License Keys & Digital Secrets:**
   - Keys displayed in the Admin 360 profile are masked by default (e.g. `XXXX-XXXX-XXXX-1A2B`).
   - Unmasking requires an explicit POST to `/api/admin/users/[id]/reveal-credential` with an administrative justification reason.
   - Every reveal action logs an immutable event (`CREDENTIAL_REVEALED_BY_ADMIN`) in the `AdminAuditLog` table capturing staff ID, timestamp, target key, and reason.
3. **Session Cookies & Auth Tokens:** Ephemeral session identifiers are validated server-side. Session revocation invalidates all active sessions immediately.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
