# 00 — EXISTING SYSTEM DISCOVERY & ARCHITECTURAL BASELINE

## 1. System Technology Stack & Environment

An exhaustive inspection of the AI Haat repository confirms the following production technology stack:
- **Framework:** Next.js 15.5.26 using App Router architecture.
- **Frontend Core:** React 18 with client-side reactive hooks and React Server Components (RSC).
- **Language & Type System:** TypeScript 5.x running in strict mode (`tsc --noEmit` verified with 0 errors).
- **ORM & Data Layer:** Prisma ORM 5.19.1 / 6.x connecting to MySQL 8.x.
- **Authentication & Identity:** NextAuth.js v4 with Google OAuth and custom credentials provider.
- **Styling & UI:** Tailwind CSS v3.4.1, Lucide React icons, and custom design tokens.
- **Server Process Manager:** PM2 Cluster Mode running on Hostinger Linux VPS (`srv1497.hstgr.io`).
- **Edge Reverse Proxy:** Cloudflare with `cf-connecting-ip` and `cf-ipcountry` headers terminating to Nginx.

---

## 2. Baseline Architecture & Data Flow

The application manages high-value digital goods (software licenses, shared subscription accounts, and game keys) in Bangladesh, integrating Mobile Financial Services (bKash, Nagad, Rocket) alongside an internal customer wallet system (`walletBalanceBDT`).

```
┌────────────────────────────────────────────────────────┐
│               AI HAAT ARCHITECTURE STACK               │
├────────────────────────────────────────────────────────┤
│ Client Browser / Mobile Responsive Viewport (< md)     │
│       ▲                                                │
│       ▼                                                │
│ Cloudflare Edge (WAF, SSL, Caching, IP Geolocation)    │
│       ▲                                                │
│       ▼                                                │
│ Nginx Reverse Proxy (Hostinger Linux VPS)              │
│       ▲                                                │
│       ▼                                                │
│ Next.js 15 App Router (PM2 Cluster Instances)          │
│   ├── Edge Middleware: CSRF & Same-Origin Defense      │
│   ├── /api/admin/*: Administrative Control Routes      │
│   ├── /api/orders/*: Checkout & Invoicing Engine       │
│   ├── /api/wallet/*: Atomic Financial Transactions     │
│   └── /admin/*: Enterprise User 360° Control Center    │
│       ▲                                                │
│       ▼                                                │
│ Prisma ORM & Service Layer                             │
│   ├── UserControlService (Entitlements, Status, Notes) │
│   ├── UserIntelligenceService (IP, Devices, Consent)   │
│   └── MediaOptimizer (Multi-Variant WebP Sharp Engine) │
│       ▲                                                │
│       ▼                                                │
│ MySQL 8.0 Database (Hostinger Managed DB Instance)     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Pre-Existing Audit & Repair Baseline

Prior audits identified and resolved 18 release-blocking defects:
1. BOLA / IDOR Guest Invoice PDF download vulnerability remediated with signed HMAC tokens.
2. Digital gift claim secrets redacted from public tracking responses.
3. SVG script injection neutralized via binary magic-byte inspection (raster-only WebP/PNG/JPG).
4. Global rate-limiting collapse eliminated via Cloudflare/Nginx reverse proxy resolvers.
5. Administrative MFA fail-closed policy enforced for unenrolled staff accounts.
6. Mailer passwords encrypted at rest via AES-256-GCM (`v1:` envelope).
7. Missing HTTP methods (`POST` on `/api/admin/products`, `PUT` on `/api/admin/products/[id]`) restored.
8. Integer poisha commerce arithmetic applied across prices, orders, and wallet adjustments.
