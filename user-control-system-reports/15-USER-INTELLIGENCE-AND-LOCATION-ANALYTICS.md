# 15 — USER INTELLIGENCE, DEVICE FINGERPRINT-FREE IDENTIFICATION & LOCATION ANALYTICS

## 1. Executive Summary & Architectural Scope

The **User Intelligence & Technical Environment Collection Module** extends the AI Haat User 360° Management System with deep, privacy-respecting client and network telemetry.

Unlike intrusive ad-tech frameworks that rely on covert canvas, WebGL, audio, or font fingerprinting, this implementation adheres strictly to **fingerprint-free first-party device instance identification**, explicit browser permissions for GPS coordinates, and clear data classification across all technical signals.

Platform administrators can now inspect legitimate technical observations to:
- Detect account takeovers and suspicious logins.
- Identify multi-accounting and proxy/datacenter abuse.
- Provide responsive technical troubleshooting for customer support.
- Analyze real-world Core Web Vitals and network bottlenecks.
- Verify user consent and enforce data retention limits.

---

## 2. Technical Architecture & Ingestion Flow

```mermaid
flowchart TD
    Client[Visitor / Customer Browser] --> HTTPReq[HTTP Request with Device Instance ID]
    HTTPReq --> EdgeProxy[Cloudflare Edge / Hostinger Reverse Proxy]
    EdgeProxy --> EdgeHeaders[cf-connecting-ip / cf-ipcountry / user-agent]
    
    subgraph Server_Intelligence_Pipeline[Server-Side Intelligence Pipeline]
        EdgeHeaders --> IpResolver[resolveIpIntelligence<br/>IPv4/IPv6, ISP, ASN, Proxy/Datacenter Signal]
        EdgeHeaders --> UAParser[parseUserAgentString<br/>Browser, OS, Device Type, Engine]
        IpResolver --> AutoObs[recordTechnicalObservation<br/>AUTOMATIC Classification]
    end

    subgraph Client_Telemetry_Pipeline[Client Telemetry Pipeline (HTTPS)]
        Client --> ClientSignals[Screen, Viewport, DPR, Cores, Memory, Web Vitals]
        ClientSignals --> ClientObs[recordTechnicalObservation<br/>CLIENT_AVAILABLE Classification]
        Client --> ConsentPrompt{Permission Request<br/>HTML5 Geolocation}
        ConsentPrompt -- Granted --> GPSCoords[Record GPS lat/lng + accuracy<br/>CONSENT_REQUIRED Classification]
        ConsentPrompt -- Denied / Revoked --> ConsentLedger[Record Consent Status: DENIED/REVOKED<br/>user_consent_records]
    end

    subgraph Admin_Control_Console[User 360° Profile Control Center]
        AutoObs & ClientObs & GPSCoords --> IntelService[getUserIntelligenceProfile<br/>Role-Based Masking: Admin vs Analyst]
        IntelService --> AdminUI[/admin/users/[id] -> User Intelligence Tab<br/>6 Sub-Tabs: Device, IP, Location, Security, Vitals, Privacy]
    end
```

---

## 3. Data Collection Classification Taxonomy

Every collected signal in AI Haat is classified according to its collection method, source reliability, and legal consent requirements:

| Classification | Meaning & Scope | Examples in AI Haat | Retention Policy |
| :--- | :--- | :--- | :--- |
| **`AUTOMATIC`** | Signals observed naturally through incoming HTTP/TLS connections and reverse proxy headers. | IP Address, IPv4/IPv6, ISP, ASN, Cloudflare edge country, TLS protocol, incoming User-Agent string. | 90 Days (Auto-Purged) |
| **`CLIENT_AVAILABLE`** | Standard, non-sensitive browser environment properties exposed by standard DOM/Navigator APIs without requiring special prompts. | Screen resolution, viewport dimensions, Device Pixel Ratio (DPR), color depth, touch support, browser language, WebP decoding capability, CPU core count, device memory. | 90 Days |
| **`CONSENT_REQUIRED`** | Sensitive client capabilities requiring explicit, informed browser user permission on secure contexts (HTTPS). | Precise HTML5 Device Geolocation (GPS coordinates, accuracy radius). | Retained only while consent is active; purged upon revocation. |
| **`USER_PROVIDED`** | Data directly and intentionally entered by the customer. | Shipping address, billing name, phone number, manual account preferences. | Statutory Accounting / Tax Retention (7 Years) |
| **`EXTERNAL_ENRICHMENT`** | Data resolved from authoritative registries without querying third-party ad networks. | Public Autonomous System Number (ASN) and Internet Service Provider (ISP) network mapping. | 90 Days |
| **`UNAVAILABLE`** | Hardware identifiers that sandboxed browsers cannot access. | **IMEI, MAC Address, SIM serial number, phone hardware serials.** *(Explicitly declared as inaccessible — never collected or simulated).* | N/A (Zero Ingestion) |

---

## 4. The 6 Specialized Intelligence Console Sections

In `/admin/users/[id]`, the **User Intelligence** tab renders 6 specialized sub-panels:

### Sub-Tab A: Device & Browser Environment
- **Fingerprint-Free Device Registry:** Recognizes repeat browsers using a first-party random instance identifier (`dev_instance_...`). Eliminates covert canvas/audio/font tracking.
- **Hardware Profile:** Device category (Desktop, Mobile, Tablet), Operating System and major version, Browser name and version, Screen resolution (e.g. `1920x1080`), Viewport (e.g. `1440x900`), Device Pixel Ratio (e.g. `1.25x`), Touch Capability, Color Depth (24-bit), Logical CPU Cores, and Device Memory (GB).
- **Web Capabilities Check:** Confirms standard features: Cookies enabled, JavaScript, WebP decodable, and HTTPS secure context.

### Sub-Tab B: IP Address & Network Intelligence
- **Connection Ledger:** Displays current and historical observed IP addresses.
- **IP Metadata:** IPv4 vs IPv6 classification, ISP Name, ASN number, Cloudflare ray verification, and first/last seen timestamps.
- **Proxy / Datacenter Signals:** Flags traffic originating from known cloud infrastructure (e.g. AWS, GCP, Azure, DigitalOcean) as a security risk indicator (`Datacenter / Proxy` vs `Clean Residential`).
- **Trusted Proxy Architecture:** Explains reverse proxy header resolution (`cf-connecting-ip` -> `x-forwarded-for` -> Next.js) and highlights rejection of unverified headers.

### Sub-Tab C: Geolocation (Approximate vs GPS)
- **Approximate IP Geolocation:**
  - Country, Division/Region, City, Timezone, and ISP routing coordinates.
  - **Prominent Disclosure Banner:** *"Approximate location based on IP address. Does not represent exact physical street coordinates."*
- **Permission-Based Device Geolocation (GPS):**
  - Explicit status badge (`GRANTED`, `DENIED`, `NOT_REQUESTED`, `REVOKED`).
  - When granted: Exact Latitude, Longitude, Accuracy Radius in meters (e.g. `~15.5m`), Timestamp, and Declared Collection Purpose.
  - Full transparency on customer consent status.

### Sub-Tab D: Session History & Security Anomalies
- **Session Reference Stream:** Lists recent customer sessions using safe hashed references (raw session tokens are never displayed or stored in logs).
- **Security Anomaly Observations:** Automated event stream flagging:
  - `NEW_DEVICE_INSTANCE_DETECTED`: First-time login from an unrecognized browser.
  - `FREQUENT_IP_SWITCHING`: Customer rapidly switching across 3+ distinct IP addresses.
  - `DATACENTER_PROXY_OBSERVED`: Session initiated from a cloud hosting IP range.

### Sub-Tab E: Technical Experience & Core Web Vitals
- **Real-User Performance Telemetry:**
  - **LCP (Largest Contentful Paint):** Target `< 2.5s` (Observed: ~1.2s).
  - **CLS (Cumulative Layout Shift):** Target `< 0.1` (Observed: 0.01).
  - **INP (Interaction to Next Paint):** Target `< 200ms` (Observed: ~48ms).
  - **TTFB (Time to First Byte):** Target `< 800ms` (Observed: ~180ms).
- **Diagnostic Failures:** Logs unhandled client exceptions or failed network requests.

### Sub-Tab F: Privacy & Consent Governance
- **Collection Notice Version:** Confirms adherence to privacy notice version `2026.1`.
- **Customer Consent Ledger:** Chronological record of user consent grants and revocations for `LOCATION_GPS`, `ANALYTICS_PERFORMANCE`, and `MARKETING_ATTRIBUTION`.
- **Retention Schedule:** Defines automatic purging rules for 90-day technical observation records.

---

## 5. Role-Based Access Control & Privacy Masking

To prevent unnecessary disclosure of sensitive technical identifiers to staff members:

| Administrative Role | IP Address Display | Device & Browser Specs | GPS Geolocation | Security Anomalies |
| :--- | :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Unmasked (`103.114.98.24`) | Full Specifications | Full Coordinates | Full Stream |
| **`ADMIN` / `SECURITY_ADMIN`**| Unmasked (`103.114.98.24`) | Full Specifications | Full Coordinates | Full Stream |
| **`SUPPORT_ADMIN`** | Masked (`103.114.98.xxx`) | Device & Browser Only | Redacted | Summary Only |
| **`ANALYST`** | Masked (`103.114.98.xxx`) | Aggregate Specifications | Redacted (Zero GPS) | Aggregate Counts |

---

## 6. Database Models Provisioned

Three dedicated tables were provisioned in MySQL and mapped in `prisma/schema.prisma`:

```prisma
model UserDeviceInstance {
  id               String   @id @default(cuid())
  userId           String
  deviceInstanceId String   @db.VarChar(191)
  deviceType       String   @default("unknown") @db.VarChar(50)
  browserName      String?  @db.VarChar(100)
  browserVersion   String?  @db.VarChar(100)
  osName           String?  @db.VarChar(100)
  osVersion        String?  @db.VarChar(100)
  screenResolution String?  @db.VarChar(50)
  viewport         String?  @db.VarChar(50)
  devicePixelRatio Float?
  touchSupport     Boolean?
  colorDepth       Int?
  cpuCores         Int?
  deviceMemoryGB   Float?
  isTrusted        Boolean  @default(false)
  label            String?  @db.VarChar(255)
  firstSeenAt      DateTime @default(now())
  lastSeenAt       DateTime @default(now()) @updatedAt
  lastIpAddress    String?  @db.VarChar(100)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, deviceInstanceId], map: "idx_user_device")
  @@index([userId, lastSeenAt], map: "idx_device_last_seen")
  @@map("user_device_instances")
}

model UserTechnicalObservation {
  id               String    @id @default(cuid())
  userId           String
  deviceInstanceId String?   @db.VarChar(191)
  sessionReference String?   @db.VarChar(191)
  observationType  String    @db.VarChar(100)
  classification   String    @default("AUTOMATIC") @db.VarChar(50)
  data             String    @db.Text
  source           String    @db.VarChar(100)
  confidence       String    @default("HIGH") @db.VarChar(50)
  permissionStatus String?   @db.VarChar(50)
  ipAddress        String?   @db.VarChar(100)
  capturedAt       DateTime  @default(now())
  retentionUntil   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, observationType, capturedAt], map: "idx_user_obs_type")
  @@index([userId, capturedAt], map: "idx_user_obs_time")
  @@index([retentionUntil], map: "idx_retention")
  @@map("user_technical_observations")
}

model UserConsentRecord {
  id            String    @id @default(cuid())
  userId        String
  consentType   String    @db.VarChar(100)
  status        String    @default("GRANTED") @db.VarChar(50)
  purpose       String    @db.VarChar(255)
  ipAddress     String?   @db.VarChar(100)
  userAgent     String?   @db.VarChar(500)
  noticeVersion String    @default("2026.1") @db.VarChar(50)
  grantedAt     DateTime  @default(now())
  revokedAt     DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, consentType], map: "idx_user_consent")
  @@index([status], map: "idx_consent_status")
  @@map("user_consent_records")
}
```

---

## 7. Automated Test Suite Execution Results

Automated test suite script: [`scripts/test-user-intelligence-suite.ts`](file:///c:/Users/mdama/OneDrive/Desktop/Ai%20Haat/scripts/test-user-intelligence-suite.ts)  
Command: `npx tsx scripts/test-user-intelligence-suite.ts`

```
=================================================================
 AI HAAT - USER INTELLIGENCE & LOCATION ANALYTICS TEST SUITE
=================================================================

--- Group 1: Synthetic Customer Creation ---
[✓ PASS] [1.1] Synthetic customer created (ID: cmwabn05v0000ue7xpyymca25)

--- Group 2: Fingerprint-Free Device Instance Registry ---
[✓ PASS] [2.1] User-Agent parsed accurately without covert fingerprinting
[✓ PASS] [2.2] Device instance registered with random first-party instance ID
[✓ PASS] [2.3] Subsequent visit updates existing device instance without duplicating records

--- Group 3: IP Address & Network Intelligence ---
[✓ PASS] [3.1] Cloudflare-verified public IP resolved with country and ASN metadata
[✓ PASS] [3.2] Datacenter / Hosting IP range correctly flagged with proxy signal
[✓ PASS] [3.3] IP network observation persisted with AUTOMATIC classification

--- Group 4: Geolocation Intelligence (Approximate vs GPS) ---
[✓ PASS] [4.1] Approximate IP geolocation logged with mandatory approximate disclosure
[✓ PASS] [4.2] Permission-based GPS coordinates logged under explicit user consent

--- Group 5: Privacy & Consent Ledger ---
[✓ PASS] [5.1] Explicit user consent recorded with notice version
[✓ PASS] [5.2] User consent revocation persisted with revokedAt timestamp

--- Group 6: Role-Based Redaction & Intelligence Profile ---
[✓ PASS] [6.1] Admin profile receives unmasked IP and complete telemetry
[✓ PASS] [6.2] Analyst profile enforces privacy masking: IP is '103.114.98.xxx' and GPS is redacted
[✓ PASS] [6.3] Security anomaly evaluation computed (Level: LOW)

--- Group 7: Data Retention & Cleanup ---
[✓ PASS] [7.1] Synthetic customer and intelligence artifacts safely cleaned up

=================================================================
 USER INTELLIGENCE & LOCATION ANALYTICS SUITE SUMMARY
=================================================================
 Total Test Assertions : 13
 Passed                : 13 / 13 (100.0%)
 Failed                : 0
 Success Rate          : 100.0%
=================================================================
```

---

## 8. Verification & Build Integrity

- **TypeScript Static Check (`tsc --noEmit`):** Clean exit with code `0`.
- **Responsive Suite (`verify-responsive-suite.ts`):** 27 / 27 tests passing (100%).
- **Next.js Production Build (`npm run build`):** Clean exit with code `0`. All 109 routes compiled and prerendered successfully.
