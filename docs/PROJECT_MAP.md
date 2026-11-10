# AI Haat project map

## Runtime shape

The application uses the Next.js App Router. Route entry points live under `src/app`; API handlers live under `src/app/api`; shared server and domain code lives under `src/lib`; UI components are primarily under `src/components`.

```text
src/
├── app/          route entries, layouts, pages, API handlers, admin and dashboard areas
├── components/   reusable UI plus domain UI (admin, checkout, cart, product, tracking)
├── lib/          auth, commerce, orders, payments, subscriptions, email and integrations
├── hooks/        client hooks
├── context/      React context providers
├── data/         product and application data modules
├── types/        shared TypeScript contracts
└── utils/        cross-cutting pure helpers
prisma/           Prisma schema and migrations/configuration
public/           runtime assets
scripts/          maintenance, audits, and safe verification suites
docs/             architecture, QA, deployment and operational evidence
```

## Business domains

- Products and catalog: `src/app/shop`, `src/app/product`, `src/lib/commerce/products.ts`, `src/components/product`
- Cart and checkout: `src/app/cart`, `src/app/checkout`, `src/components/cart`, `src/components/checkout`
- Orders and fulfillment: `src/app/dashboard/orders`, `src/app/order-tracking`, `src/lib/orders-db.ts`, `src/app/api/orders`
- Auth and access: `src/app/api/auth`, `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/middleware.ts`
- Subscriptions and wallet: `src/app/dashboard`, `src/app/wallet`, `src/app/api/wallet`
- Administration: `src/app/admin`, `src/components/admin`, `src/app/api/admin`
- User controls/intelligence: `src/lib/user-control`, `src/lib/user-intelligence`, `src/app/api/admin/users`

## Where to edit

| Change | Start here |
| --- | --- |
| Product card/detail UI | `src/components/product/` |
| Checkout presentation | `src/components/checkout/` |
| Checkout/order orchestration | `src/app/checkout/`, `src/app/api/orders/`, `src/lib/orders-db.ts` |
| Payment gateway behavior | Existing payment modules under `src/lib/` and their API routes; preserve contracts |
| Admin user table/details | `src/app/admin/users/`, `src/components/admin/`, `src/app/api/admin/users/` |
| Shared image handling | `src/components/SafeImage.tsx`, `src/components/ImageUpload.tsx`, `src/lib/media/` |
| Legal/static copy | `src/app/about`, `src/app/privacy`, `src/app/terms` |

See `docs/ARCHITECTURE.md`, `docs/ROUTE_MAP.md`, `docs/MODULE_DEPENDENCIES.md`, and `docs/WHERE_TO_EDIT.md` for deeper navigation.
