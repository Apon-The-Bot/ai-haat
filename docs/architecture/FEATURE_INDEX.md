# Feature index

Use this map before changing a feature. Start at the route, follow only direct imports, and keep business rules in `src/lib` rather than route components.

| Feature | Routes / UI | Domain and persistence |
| --- | --- | --- |
| Storefront and catalog | `src/app/shop`, `src/app/product`, `src/components/product` | `src/lib/commerce/products.ts`, `src/data` |
| Cart and checkout | `src/app/cart`, `src/app/checkout`, `src/components/cart`, `src/components/checkout` | cart, pricing, orders, payment modules in `src/lib` |
| Orders and fulfillment | dashboard order routes and order APIs | `src/lib/orders-db.ts`, inventory and fulfillment modules |
| Auth, MFA, access | auth/security routes and middleware | `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/lib/mfa` |
| Wallet and subscriptions | wallet, subscription and entitlement routes | wallet, subscriptions and payment modules |
| Administration | `src/app/admin`, `src/components/admin` | admin queries, audit logging and control modules |
| Email and marketing | email/API routes and campaign UI | `src/lib/email*`, campaign and audience modules |
| WhatsApp automation | `src/app/admin/whatsapp`, related API routes | WhatsApp service, scheduler, persistence and Baileys integration |
| Media and uploads | upload/avatar/media routes and components | storage, image processing and media helpers |
| User intelligence/control | dashboard and user-control routes | `src/lib/user-intelligence`, `src/lib/user-control` |

Cross-cutting boundaries include `src/lib/prisma.ts`, `src/lib/auth-guard.ts`, `src/lib/audit-logger.ts`, `src/lib/security`, `src/middleware.ts`, and `prisma/schema.prisma`.
