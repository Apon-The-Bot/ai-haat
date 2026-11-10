# Route map

Route paths are defined by the Next.js App Router under `src/app`. Dynamic segments in brackets are preserved exactly.

## Public and customer routes

| Area | Route entry | Ownership |
| --- | --- | --- |
| Catalog | `/shop`, `/product/[slug]`, `/compare` | `src/app/shop`, `src/app/product`, `src/components/product` |
| Cart/checkout | `/cart`, `/checkout`, `/order-success` | `src/app/cart`, `src/app/checkout`, `src/components/checkout` |
| Account | `/dashboard/**`, `/wallet` | `src/app/dashboard`, `src/app/wallet` |
| Informational | `/about`, `/privacy`, `/terms`, `/blog/**` | corresponding `src/app` folders |
| Auth | `/login`, `/auth/**` | `src/app/login`, `src/app/auth`, `src/app/api/auth` |

## Admin and API

Admin pages are under `/admin/**` and API handlers are under `/api/**`. The authoritative route inventory is generated from `src/app/**/page.*` and `src/app/**/route.*`; run `npm run architecture:check` after route changes. Existing middleware and route-level guards must remain in place.
