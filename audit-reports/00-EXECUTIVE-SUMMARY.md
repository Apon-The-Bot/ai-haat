# 00 — EXECUTIVE SUMMARY

## Project Overview

**Project Name:** AI Haat (`aihaat.shop`)  
**Audited Revision:** `e019fa803069b484c9d77f0b9d17903b25d72ebd` (with local uncommitted `Footer.tsx` diff)  
**Audit Date:** November 9, 2026  
**Audited Scope:** 100% Repository-Wide Architecture, Code Quality, Security, Performance, Database, Business Logic, APIs, DevOps, Testing, and Production Readiness.  
**Tech Stack:** Next.js 15.5.26 (App Router), React 18.3.1, TypeScript 5.9.3, Prisma ORM 5.19.1, MySQL 8.0, NextAuth 4.24.15, Tailwind CSS 3.4.14, PM2 Cluster.

---

## Executive Status & Verdict

| Category | Status | Assessment Score (0–10) | Primary Driver |
| :--- | :---: | :---: | :--- |
| **Security** | ⚠️ High Risk | **4.5 / 10** | Unauthenticated gift credential leak in order tracking; BOLA/IDOR on guest invoice PDF download; stored XSS in SVG uploads; admin MFA bypass if not enrolled. |
| **Architecture** | ⚠️ Fragmented | **5.5 / 10** | Dual persistence layer: MySQL (Prisma) vs. local disk JSON (`data/*.json`); PM2 cluster in-memory state desynchronization. |
| **Code Quality** | 🟡 Acceptable | **6.5 / 10** | Type-safe (zero compiler errors); good component modularity; missing hook deps and duplicate admin routes. |
| **Performance** | 🟡 Moderate | **6.0 / 10** | Global `no-store` cache header in `next.config.mjs`; synchronous JSON disk I/O in API routes; unindexed foreign keys. |
| **Database Design** | ⚠️ Inconsistent | **5.0 / 10** | Schema drift (`Float` in Prisma vs. `DECIMAL(12,2)` in migration SQL); missing indexes on critical foreign keys. |
| **API Reliability** | ⚠️ Partial Defect | **5.5 / 10** | Broken Admin Product Create/Edit (HTTP 405); missing rate limiting on public endpoints; global IP rate limiter collapse. |
| **UI/UX & Accessibility** | 🟢 Good | **7.5 / 10** | Polished bilingual (Bangla/English) ecommerce UI; clean micro-interactions; missing keyboard focus indicators in modals. |
| **Scalability** | ⚠️ Fragile | **4.0 / 10** | Multi-worker PM2 cluster race conditions; in-memory rate limiter; local file uploads in `public/uploads/` (not persistent/shared). |
| **Testing & QA** | 🟢 Substantial | **7.0 / 10** | 30+ comprehensive test scripts in `scripts/`; however, tests write directly to live production DB without staging isolation. |
| **Production Readiness** | 🔴 **NOT READY** | **4.5 / 10** | **RELEASE BLOCKING**: P0 security vulnerabilities and critical admin product mutation failures must be resolved before general release. |

---

## Key Findings Summary

### 1. Critical Security Vulnerabilities (P0 / Immediate Action Required)
1. **AUDIT-001 (BOLA / IDOR in Guest Invoice Download):** `GET /api/orders/[id]/invoice` generates PDF invoices without authentication when `?email=` is omitted for guest orders (`src/app/api/orders/[id]/invoice/route.ts#L41-L47`), leaking customer PII, phone number, and purchase details.
2. **AUDIT-002 (Digital Gift Credential Leakage in Public Tracking):** `GET /api/orders?tracking=true&query=...` exposes plain `giftClaimToken` in the response (`src/app/api/orders/route.ts#L137`). Anyone searching an order or phone number can claim the token and retrieve plaintext software license keys, accounts, emails, and passwords via `/api/gift/claim/[token]` without authentication.
3. **AUDIT-003 (Stored XSS via Unsanitized SVG Uploads):** `src/lib/security/upload-validator.ts#L52-L56` permits SVG uploads without XML sanitization or script stripping. Files are saved directly to `public/uploads/` on the main domain with `script-src 'unsafe-inline'`, enabling stored XSS.
4. **AUDIT-004 (Global Rate-Limiter Collapse - Denial of Service):** Because `TRUST_PROXY` is undefined in `.env`, `getClientIp` returns `"unknown:direct"` for every visitor worldwide (`src/lib/rate-limit.ts#L72`). All global traffic shares tiny buckets (e.g. 6 requests/minute for payment initialization), causing legitimate customers globally to receive 429 Too Many Requests.
5. **AUDIT-005 (Admin MFA Bypass When Not Enrolled):** `requireAdminMfa()` in `src/lib/auth-guard.ts#L80-L119` returns `mfaLevel: 'NONE'` if the admin has not enrolled in TOTP, allowing unverified admin sessions to execute privileged operations without 2FA.

### 2. Broken Core Functionality
1. **AUDIT-009 (Admin Product Form 405 Method Not Allowed):** `src/components/admin/ProductEditorForm.tsx#L248` calls `POST /api/admin/products` to create and `PUT /api/admin/products/[id]` to edit. Neither method exists on those routes, breaking admin product creation and editing completely. Meanwhile, `POST /api/products` is public and lacks admin MFA enforcement.
2. **AUDIT-011 (Missing `/login` Route):** NextAuth is configured with `pages: { signIn: "/login" }` (`src/lib/auth.ts#L182`), but `/login/page.tsx` does not exist, causing 404 Not Found upon redirect.

### 3. Architecture & Reliability Bottlenecks
1. **AUDIT-012 (Dual-State Architecture):** Order, wallet, user, and Telegram configurations are duplicated between MySQL Prisma and local JSON files (`data/*.json`). In PM2 cluster mode, concurrent writes overwrite JSON files, and redeployments wipe local state.
2. **AUDIT-014 (Financial Precision Schema Drift):** Prisma schema declares `Float` for `walletBalanceBDT`, `totalBDT`, `subtotalBDT`, and `discountBDT`, while migration SQL altered them to `DECIMAL(12, 2)`. Running `prisma db push` risks reverting columns to Float and introducing floating-point math rounding errors.
3. **AUDIT-016 (Local Uploads on Ephemeral Disks):** Uploaded files are written directly to `public/uploads/`. Without S3/R2 object storage or shared persistent volumes, uploads are not shared between PM2 cluster workers and will be lost during server upgrades or container rebuilds.

---

## Release Decision

**DECISION: NOT READY FOR PRODUCTION (CONDITIONALLY READY AFTER P0/P1 REMEDIATION)**

The application possesses impressive domain capabilities (digital licensing, automated delivery, wallet ledger, viral loops, gifting, PDF invoices, and email marketing), but **must not be deployed to public production** until the 5 critical security vulnerabilities and the admin product mutation endpoints are remediated and verified.

Refer to the individual reports in `audit-reports/` for comprehensive evidence, static analysis traces, and remediation specifications.
