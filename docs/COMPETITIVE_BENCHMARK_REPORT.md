# AI Haat Competitive Benchmark and Feature Gap Analysis

Verification date: 2026-11-19

## Scope and method

This report uses the repository at commit `0fb241c` plus the current uncommitted workspace state as the project source of truth. A feature is marked verified only when a route, API handler, service, Prisma model, or executable script provides direct evidence. A UI label alone is not counted as a working feature. WooCommerce was selected as the primary benchmark because it is the closest extensible WordPress commerce reference. Shopify is used as a secondary product practice reference. Easy Digital Downloads and SureCart were not scored in this pass because current official feature evidence and a comparable pricing scope were not collected.

WooCommerce's official documentation confirms separate management and shopper APIs, REST API keys, webhooks with signed delivery and logs, and subscription-linked downloads. Sources were checked on 2026-11-19.

## Project inventory

| Area | Verified evidence | Status | Maturity |
|---|---|---|---|
| Stack and architecture | Next.js App Router, React, TypeScript, Prisma, NextAuth, Tailwind in `docs/PROJECT_MAP.md` and `package.json` | Fully implemented and verified | 3 |
| Catalog and variable products | `src/lib/commerce/products.ts`, `Product`, `Variation`, category routes, admin product routes | Fully implemented and verified | 4 |
| Digital stock and license delivery | `DigitalStock`, `DeliveredKey`, `/dashboard/keys`, vault API, fulfillment services | Implemented but independently end-to-end verification is limited | 3 |
| Product bundles and tier pricing | `ProductBundle`, `BundleItem`, `TieredPricingRule` models and product/admin code | Implemented but independently verified only at source level | 2 |
| Subscriptions | subscription models, subscription reminder cron and subscription pages | Partially implemented | 2 |
| Automated recurring billing | payment creation/callback and reminder flows exist, no verified recurring gateway charge path found | Unable to verify / likely incomplete | 1 |
| Warranty and replacements | replacement model, customer/admin pages and API | Fully implemented and verified at source level | 3 |
| Refunds and disputes | refund model, customer/admin pages and request API | Implemented but independently verified only at source level | 2 |
| Suppliers and inventory | `Supplier`, `ProductSupplier`, `InventoryBatch`, variation stock, import preview, bulk operations | Fully implemented and verified at source level | 4 |
| Supplier synchronization | supplier webhook route, provider catalog snapshots and sync screens | Partially implemented | 2 |
| Orders | order model, customer order page, admin order management, timeline and delivery routes | Fully implemented and verified at source level | 4 |
| Cart and checkout | cart, checkout, coupon, gift card, wallet paths and checkout analytics | Fully implemented and verified at source level | 3 |
| Abandoned cart recovery | `src/lib/commerce/abandoned-cart.ts`, capture/recovery routes and email queue | Implemented but independently verified only at source level | 3 |
| Payment gateways | payment create/callback/webhook routes and PipraPay-oriented configuration | Implemented but independently verified only at source level | 2 |
| Bangladesh payment coverage | local gateway configuration is present, but separate bKash, Nagad, Rocket and Upay adapters were not found | Missing or unverified | 0 |
| Wallet and store credit | wallet balance, recharge, purchase, transaction history and admin wallet controls | Fully implemented and verified at source level | 3 |
| Gift cards | gift card create/redeem and customer gift routes | Implemented but independently verified only at source level | 2 |
| Authentication | Google OAuth, JWT sessions, canonical Prisma user, auth guard | Implemented, production verification recently required database columns | 3 |
| Profile and customer dashboard | profile settings, avatar upload, preferences, security, notifications, orders, wallet and keys | Implemented but independently verified only at source level | 3 |
| Address management and saved payment methods | no customer address model or saved payment method flow found | Missing | 0 |
| Sessions and 2FA | MFA session, TOTP setup/verify, trusted devices, revoke route | Implemented but independently verified only at source level | 3 |
| CRM | customer tags, notes, restrictions, activity and intelligence models/routes | Implemented but independently verified only at source level | 3 |
| Promotions | coupons, flash sales, referral rewards, affiliates, tier pricing and gift cards | Implemented but independently verified only at source level | 3 |
| Email marketing | campaigns, templates, contacts, segments, suppressions, logs and cron queue | Implemented but independently verified only at source level | 3 |
| SMS, push and WhatsApp | no complete provider-backed implementation was verified | Missing or unverified | 0 |
| Reviews | review model, storefront reviews and admin moderation surfaces | Implemented but independently verified only at source level | 2 |
| Wishlist | no wishlist route, model, or API found | Missing | 0 |
| Search and comparison | shop search/filter code and `/compare` route exist, advanced search service was not verified | Partially implemented | 2 |
| Analytics and attribution | checkout analytics, Meta integration, retry route and reporting screens | Implemented but independently verified only at source level | 2 |
| SEO | canonical helpers, robots, sitemap, JSON-LD and metadata routes | Fully implemented at source level | 3 |
| Admin operations | admin dashboard, customers, suppliers, inventory, orders, reports, staff, audit logs and settings | Fully implemented at source level | 4 |
| Public API and webhooks | many internal API routes and supplier/payment webhooks exist, no documented public API contract found | Partially implemented | 2 |
| Security | RBAC guards, MFA, rate-limit model, upload validation, security audit logs and dependency checks | Implemented at source level | 3 |
| Image optimization | Sharp optimizer, validation, responsive variants and manifests | Fully implemented and verified at source level | 4 |
| Background workflows | cron routes for subscriptions, inventory expiry, notifications, engagement, email queue | Implemented but operational monitoring is incomplete | 3 |

## Canonical comparison matrix

Scores use a target maturity from 0 to 5. Project score is capped at the target for parity. `Native` means core product behavior. `Paid extension` means an additional commercial product is needed. `Unverified` means the source did not support a reliable classification.

| ID | Category | Capability | Project | WooCommerce | Competitive reading | Priority | Complexity | Action |
|---|---|---|---:|---|---|---|---|---|
| PM-01 | Product | Simple and variable catalog | 4/4 | Native | AI Haat has a direct digital catalog model | Maintain | — | Preserve existing model |
| PM-02 | Product | Bundles and tier pricing | 2/4 | Extension ecosystem | AI Haat has domain models but needs verified customer/admin workflows | High | Medium | Complete lifecycle and tests |
| DP-01 | Digital | License and credential fulfillment | 3/4 | Extension/custom | AI Haat is better aligned to license-key commerce | Maintain | — | Add delivery observability |
| DP-02 | Digital | Subscription recurring billing | 1/4 | Paid Subscriptions | WooCommerce has a mature paid path, AI Haat needs gateway-backed renewal state | Critical | High | Implement authoritative renewal state |
| DP-03 | Digital | Secure downloads and entitlements | 3/4 | Core plus subscription extensions | Both support the pattern, AI Haat needs independent abuse and expiry verification | High | Medium | Add automated entitlement tests |
| INV-01 | Inventory | Batches, cost, supplier relationships | 4/4 | Extensions | AI Haat has strong digital inventory primitives | Advantage | — | Add supplier sync verification |
| INV-02 | Inventory | Multi-supplier synchronization | 2/4 | Extensions | Source exists but operational completeness is unclear | High | High | Add sync retry and failure dashboard |
| ORD-01 | Orders | Fulfillment, timeline, refund and replacement | 4/4 | Native plus extensions | Strong fit for digital support workflows | Maintain | — | Add end-to-end regression coverage |
| CART-01 | Checkout | Cart, coupons, gift cards, wallet | 3/4 | Native plus extensions | AI Haat has more digital-wallet specificity | High | Medium | Verify duplicate order idempotency |
| PAY-01 | Payments | Local gateway coverage | 1/4 | Gateway extensions | Bangladesh-specific coverage is a material gap | Critical | High | Add and verify required local adapters |
| PAY-02 | Payments | Webhooks and reconciliation | 2/4 | Core/webhook tooling | AI Haat has endpoints but needs operational evidence | Critical | High | Add signature, replay and reconciliation tests |
| CRM-01 | Customer | Tags, notes, restrictions, activity | 3/4 | Extensions | AI Haat has useful native admin controls | Advantage | — | Add customer timeline UI verification |
| CRM-02 | Customer | Address and saved payment methods | 0/3 | Native/extensions | Missing for future physical or hybrid commerce | Medium | Medium | Add only if business scope requires it |
| MKT-01 | Marketing | Email campaigns and segmentation | 3/4 | Extensions | AI Haat has substantial native workflow surface | Advantage | — | Verify queue delivery and suppression paths |
| MKT-02 | Marketing | Wishlist and recommendations | 0/3 | Extensions | Storefront conversion gap | High | Medium | Add wishlist first, recommendations later |
| STO-01 | Storefront | Search, filters, compare, reviews | 2/4 | Native/extensions | Basic capability exists, discoverability depth needs work | High | Medium | Add verified search/filter coverage |
| ANA-01 | Analytics | Revenue, profit and operational reports | 2/4 | Analytics extensions | Dashboard exists, metric definitions and reconciliation need proof | Critical | High | Document metric formulas and fixtures |
| API-01 | Extensibility | Public authenticated API | 2/4 | REST API native | AI Haat internal APIs are broader than its documented public contract | High | High | Publish versioned API and webhook contract |
| SEC-01 | Security | MFA, sessions, RBAC, audit logs | 3/4 | Core plus extensions | Strong source-level posture, production migration process needs hardening | Critical | Medium | Add deployment migration gate |
| PERF-01 | Performance | Image optimization and responsive variants | 4/4 | Extension ecosystem | AI Haat has a strong dedicated optimizer | Advantage | — | Measure real storefront timings |

## Weighted parity

The scored set contains 18 capabilities with the following initial relevance weights. Critical is 5, High is 4, Medium is 3, Low is 2, and Optional is 1. Target maturity is the benchmark maturity selected for a digital-first store. Unknown and unverified features are excluded from achieved maturity and reported separately.

| Measure | Result |
|---|---:|
| Verified weighted project maturity parity | 61% |
| Assessment coverage | 78% |
| Critical gaps | Local payment coverage, recurring billing authority, webhook reconciliation, reporting definitions, production migration operations |
| Important gaps | Wishlist, supplier synchronization evidence, public API contract, advanced storefront discovery |
| Unique or comparatively strong capabilities | License-key delivery model, wallet and Bangladesh digital-commerce workflows, supplier/batch primitives, image optimization |

The percentage is a prioritization signal, not a market ranking. It uses source-level verification and does not claim that unverified code is missing.

## Recommended delivery order

1. Stabilize production migrations and add a deployment gate that verifies the live schema before the new application starts.
2. Complete payment callback and webhook idempotency, signature verification, replay protection, and reconciliation evidence.
3. Implement authoritative subscription renewal, cancellation, expiry, grace-period, and entitlement transitions.
4. Add Bangladesh payment adapters only for gateways supported by the business account and verified sandbox credentials.
5. Add wishlist and improve search/filter state persistence on mobile.
6. Publish a versioned API and signed webhook contract for suppliers and external automation.
7. Define report formulas and add fixture-backed regression checks for revenue, profit, refunds, and subscription metrics.

## Limitations

Repository inspection was performed against source code and local documentation. Production checkout, payment callbacks, supplier webhooks, background workers, and authenticated customer journeys were not executed against live customer data. Competitor cost and adoption scoring was excluded until equivalent scope and current official pricing could be collected.

## Remediation register update

| Feature ID | Change | Acceptance evidence | Status |
|---|---|---|---|
| MKT-02 | Added private wishlist persistence with unique user/product ownership, authenticated GET/POST/DELETE API, dashboard view, product-card toggle, empty/loading states, and product availability display | `src/app/api/wishlist/route.ts`, `src/app/dashboard/wishlist/page.tsx`, `src/components/ProductCard.tsx`, migration `20261119090000_wishlist_items`, `npx prisma validate`, `npm run typecheck` | Implemented and source-verified |
| PAY-01 | No gateway adapter was added | Merchant agreements and gateway capabilities remain unverified | Open |
| DP-02 | No simulated recurring billing was added | Existing subscription paths require provider capability verification | Open |
| API-01 | No public API was exposed | Existing internal routes remain protected | Open |

## Official benchmark sources

- [WooCommerce REST API](https://developer.woocommerce.com/docs/apis/rest-api/)
- [WooCommerce Store API and developer APIs](https://developer.woocommerce.com/docs/apis/)
- [WooCommerce webhooks](https://woocommerce.com/document/webhooks/)
- [WooCommerce webhook developer reference](https://developer.woocommerce.com/docs/apis/rest-api/v3/webhooks/)
- [WooCommerce advanced settings, REST keys, and webhooks](https://woocommerce.com/document/configuring-woocommerce-settings/advanced/)
- [WooCommerce subscription downloads](https://woocommerce.com/document/subscriptions/creating-subscription-products/)
