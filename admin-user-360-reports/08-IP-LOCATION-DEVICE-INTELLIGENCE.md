# AI HAAT — IP, LOCATION & DEVICE INTELLIGENCE SPECIFICATION
**Document ID:** REPORT-08  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Client environment telemetry, reverse-proxy network resolution, fingerprint-free device identification, dual-mode geolocation, and privacy masking.

---

## 1. Executive Summary

The AI Haat User Intelligence Module provides security operations and support staff with critical environmental context for fraud prevention and technical troubleshooting. In strict adherence to global privacy principles and user trust standards, the system completely rejects invasive covert fingerprinting techniques (such as canvas manipulation, WebGL probes, audio context scraping, or battery API probing). Instead, it relies on transparent, standards-compliant HTTP metadata, consensual client instances, and legitimate network analysis.

---

## 2. Zero-Covert-Fingerprinting Architecture

Traditional browser fingerprinting attempts to create a persistent identifier by probing hardware quirks, font registries, and canvas rendering artifacts without user consent. AI Haat explicitly bans these practices.

### 2.1 Sanctioned vs Banned Techniques

| Technique | Status | Implementation Details |
| :--- | :--- | :--- |
| **Random Instance Tokens** | **SANCTIONED** | Transparent random UUID (`dev_instance_<uuid>`) stored in browser local storage. Reset upon storage clearing. |
| **HTTP User-Agent Parsing** | **SANCTIONED** | Standard parser extracting browser family, major version, and operating system for UI responsiveness. |
| **Reverse-Proxy IP Analysis** | **SANCTIONED** | Extracting client IP, ISP, and ASN for security anomaly detection and DDoS mitigation. |
| **Consented Geolocation** | **SANCTIONED** | GPS coordinates captured strictly when the user grants explicit browser permission (`LOCATION_GPS`). |
| **Canvas / WebGL Fingerprinting**| **STRICTLY BANNED**| Never probed, executed, or stored anywhere in the platform. |
| **AudioContext Fingerprinting** | **STRICTLY BANNED**| Never probed or executed. |
| **Battery / Sensor Probing** | **STRICTLY BANNED**| Banned. No hardware sensor APIs are invoked. |

---

## 3. Reverse-Proxy IP & Network Resolution

Because AI Haat operates behind reverse proxies and CDNs (Cloudflare, Nginx, Linux VPS), extracting the true client IP requires strict header priority resolution:

```typescript
// Excerpt from src/lib/user-intelligence/user-intelligence-service.ts
export function extractClientIp(headers: Headers): string {
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',');
    return parts[0].trim();
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  return '127.0.0.1';
}
```

### 3.1 Network Threat Diagnostics
The resolved IP is evaluated for:
- **Protocol:** `IPv4` or `IPv6`.
- **ISP & Autonomous System Number (ASN):** e.g., `AS24389 Grameenphone Ltd.`, `AS13335 Cloudflare Inc.`
- **Datacenter / Commercial Proxy Flag:** Datacenter ranges (AWS, DigitalOcean, Linode, Hetzner, etc.) are flagged with `isProxy: true`, highlighting traffic originating from automated bots or VPNs.

---

## 4. Dual-Mode Geolocation Architecture

The system maintains two distinct tiers of location data with clear provenance:

```
               Incoming Request from Client
                            │
                            ▼
           [ Extract IP via Proxy Headers ]
                            │
                            ▼
              Resolve Approximate IP Location
               (Country, City, Region, ISP)
                            │
             Store in user_technical_observations
             with locationSource = 'IP_APPROXIMATE'
                            │
                            ▼
            Does Client Submit GPS Coordinates?
                   │                    │
                  YES                   NO
                   │                    │
                   ▼                    ▼
     [ Check user_consent_records ]    (Complete)
       Is 'LOCATION_GPS' Granted?
             │              │
            YES             NO
             │              │
             ▼              ▼
   Ingest Coordinates    Discard GPS
   locationSource =      Reject submission
   'GPS_CONSENTED'
```

1. **Approximate IP Geolocation (`IP_APPROXIMATE`):** Derived solely from IP range databases. Accurate to city/region level; requires no special device permission.
2. **Consented GPS Location (`GPS_CONSENTED`):** Captured only when the user explicitly clicks "Allow" on the browser geolocation prompt. Before saving latitude/longitude to `user_technical_observations`, the API verifies an affirmative `LOCATION_GPS` consent record exists.

---

## 5. Role-Based Privacy Masking

To uphold the principle of least privilege, IP addresses are dynamically redacted based on the viewing staff member's administrative role:

```typescript
// Excerpt from src/lib/user-intelligence/user-intelligence-service.ts
export function maskIpAddress(ip: string, userRole: string): string {
  // SUPER_ADMIN and ADMIN see full unmasked IP
  if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
    return ip;
  }
  // SUPPORT, ANALYST, and others see redacted IP
  if (ip.includes('.')) {
    // IPv4 masking: 103.145.23.44 -> 103.145.***.***
    const segments = ip.split('.');
    return `${segments[0]}.${segments[1]}.***.***`;
  }
  // IPv6 masking: 2400:1a00:b010:1234:: -> 2400:1a00:****:****::
  return ip.substring(0, 10) + '****:****';
}
```

Support representatives can verify network continuity without exposing full customer IP addresses to unauthorized disclosure.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
