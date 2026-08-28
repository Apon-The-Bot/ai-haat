# 00 — Current QA & Testing State Audit

## Executive Summary
This document classifies the existing test infrastructure of AI Haat (`aihaat.shop`) across all 12 QA dimensions.

---

## 1. QA State Classification

| QA Dimension | Status | Existing Assets | Deficiencies & Gaps to Bridge |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | **WORKING** | Resolver, money math, duration parsing, pricing quote calculation. | Needs explicit price tampering fuzzing. |
| **Domain / Service Tests** | **WORKING** | `test-product-domain-master-suite.ts`, `test-aftersales-suite.ts`. | Needs unified runner script. |
| **API Integration Tests** | **PARTIAL** | Dedicated scripts in `scripts/`. | Needs centralized HTTP/session mock helpers. |
| **Database Tests** | **WORKING** | `test-database-integrity-suite.ts` (17/17 tests). | Needs strict production database hostname guard. |
| **Security / IDOR Tests** | **PARTIAL** | After-sales and support IDOR checks. | Needs 11-resource full IDOR matrix (Order, Vault, Notification, Refund, etc.). |
| **Payment QA** | **PARTIAL** | `test-piprapay-verify.js`, `test-trx-verify.js`. | Needs webhook duplicate replay and callback race simulation. |
| **Wallet Concurrency** | **WORKING** | Parallel promise debit/topup tests. | Needs negative number & NaN fuzzing. |
| **Inventory Concurrency** | **WORKING** | Single-stock parallel claim collision tests. | Needs multi-item mixed fulfillment race. |
| **E2E Customer Journey** | **PARTIAL** | `scripts/e2e-master-suite.ts`. | Needs headless Playwright responsive viewports. |
| **Admin Operations** | **PARTIAL** | Admin manual delivery and audit log tests. | Needs complete admin portal workflow suite. |
| **Mobile & Responsive** | **PARTIAL** | Viewport CSS testing. | Needs programmatic DOM `scrollWidth <= clientWidth` checks. |
| **SEO & Analytics** | **WORKING** | `test-seo-master-suite.ts`, `test-analytics-suite.ts`. | Verified metadata, canonicals, and purchase event deduplication. |

---

## 2. Testing Stack Decision
* **Execution Engine**: TypeScript execution via `tsx` for high-speed domain, integration, concurrency, and security suites.
* **E2E & Responsive Engine**: Playwright test orchestrator for browser and mobile viewport validation.
* **Database Target**: Dedicated isolated database connection with safety guards preventing destructive operations on production hostnames.
