# Where to edit

- Product card/detail presentation: `src/components/product/`
- Cart presentation and state: `src/components/cart/` and `src/app/cart/`
- Checkout form presentation: `src/components/checkout/`
- Order creation/invoice behavior: `src/app/api/orders/` and `src/lib/orders-db.ts`
- Auth/session behavior: `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/middleware.ts`
- Admin users and permissions: `src/app/admin/users/`, `src/app/api/admin/users/`, `src/lib/user-control/`
- Shared image behavior: `src/components/SafeImage.tsx`, `src/components/ImageUpload.tsx`, `src/lib/media/`
- Legal copy: `src/app/about`, `src/app/privacy`, and `src/app/terms`

Before editing, read `AGENTS.md`, then the closest route/component and its domain module. Preserve existing API and visual contracts.
