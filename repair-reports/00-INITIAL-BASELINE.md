# 00 — INITIAL BASELINE

**Project:** AI Haat (`aihaat.shop`)  
**Commit Baseline:** `e019fa803069b484c9d77f0b9d17903b25d72ebd`  
**Date:** November 9, 2026  
**Auditor/Engineer:** Principal Full-Stack & Security Engineer  

---

## 1. Initial State Summary

Prior to beginning repair operations, the application exhibited:
- **Build & Compilation:** `tsc --noEmit` passed with 0 compiler errors. `next lint` passed with 13 non-blocking warnings (missing hook dependencies, unoptimized `<img>` tags).
- **Security Posture:** 5 Critical/High vulnerabilities confirmed:
  - AUDIT-001: Guest invoice BOLA / IDOR PII disclosure.
  - AUDIT-002: Digital gift claim token exposure in public order tracking.
  - AUDIT-003: Stored XSS vulnerability via unsanitized SVG file uploads.
  - AUDIT-004: Global client IP collapse to `"unknown:direct"`, causing denial of service on rate-limited endpoints.
  - AUDIT-005: Admin MFA failing open for administrators without TOTP configured.
- **Core Functionality Defect:**
  - AUDIT-009: Admin product creation and editing completely broken with HTTP 405 Method Not Allowed due to missing `POST` on `/api/admin/products` and missing `PUT` on `/api/admin/products/[id]`.
- **Architectural & Database Risks:**
  - AUDIT-012: Dual persistence model splitting state between MySQL Prisma and uncoordinated disk JSON files (`data/*.json`).
  - AUDIT-014: Financial precision schema drift (`Float` in Prisma schema vs `DECIMAL(12, 2)` in database migration SQL).
  - AUDIT-015: Missing database indexes on foreign keys (`Variation.productId`, `ProductRequest.status`).
- **Production Readiness Score:** 4.5 / 10 (**NOT READY FOR PRODUCTION — RELEASE BLOCKED**).

---

## 2. Issue Inventory Baseline

| Issue ID | Area | Severity | File(s) | Baseline Status |
| :--- | :--- | :---: | :--- | :--- |
| **AUDIT-001** | Security | Critical | `src/app/api/orders/[id]/invoice/route.ts:41-47` | Confirmed Unauthenticated BOLA |
| **AUDIT-002** | Security | Critical | `src/app/api/orders/route.ts:137` | Confirmed Token Leak |
| **AUDIT-003** | Security | High | `src/lib/security/upload-validator.ts:52-56`, `src/app/api/upload/route.ts` | Confirmed Stored XSS Risk |
| **AUDIT-004** | Security / Reliability | High | `src/lib/rate-limit.ts:70-73` | Confirmed Global IP Collapse |
| **AUDIT-005** | Security | High | `src/lib/auth-guard.ts:80-120` | Confirmed Fail-Open MFA Bypass |
| **AUDIT-006** | Security | Medium | `src/app/api/admin/email-marketing/settings/route.ts` | Plaintext SMTP/API Secrets |
| **AUDIT-007** | Security | Medium | `src/lib/auth.ts:6-11` | Hardcoded Admin Emails |
| **AUDIT-008** | Security | Medium | `src/app/api/admin/**` | Missing CSRF on Admin Mutations |
| **AUDIT-009** | Functionality | Critical | `src/components/admin/ProductEditorForm.tsx:248`, `src/app/api/admin/products/**` | Broken Admin Product Create/Edit (405) |
| **AUDIT-010** | Architecture | Low | `src/app/admin/products/edit/[id]/page.tsx` | Duplicate Route |
| **AUDIT-011** | Functionality | Medium | `src/lib/auth.ts:182` | Dead `/login` Route Reference |
| **AUDIT-012** | Architecture | High | `src/lib/*-db.ts` | Race-Prone JSON Flat-Files |
| **AUDIT-013** | Reliability | Low | `src/app/api/affiliate/click/route.ts` | Unbounded Click Inflation |
| **AUDIT-014** | Database | High | `prisma/schema.prisma:254, 429-431` | Float vs Decimal Drift |
| **AUDIT-015** | Database | Medium | `prisma/schema.prisma:388-419` | Missing Foreign Key Indexes |
| **AUDIT-016** | DevOps | Medium | `src/app/api/upload/route.ts` | Ephemeral Local Disk Uploads |
| **AUDIT-017** | Performance | Low | `next.config.mjs:74-76` | Overly Restrictive `no-store` Header |
| **AUDIT-018** | Database | Low | `prisma/schema.prisma` | Missing Log Retention Policies |
