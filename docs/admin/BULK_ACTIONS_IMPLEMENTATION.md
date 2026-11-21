# Bulk actions implementation

## Shared behavior

- `src/components/admin/BulkActionBar.tsx` provides the contextual sticky toolbar, count, clear, select-all-visible, disabled, and responsive states.
- `src/app/api/admin/bulk-operations/route.ts` provides server-side preview/digest/commit for product status/category/price, coupon active state, and customer tags.
- Product, order, user, and inventory pages use explicit selected IDs and preserve the current filter/search view.
- Mutations are server-authorized with `requireAdminMfa`; high-risk user changes additionally use recent MFA.

## Implemented operations

Products: status, visibility, archive/delete, price adjustment, CSV export.

Orders: eligible status changes, cancellation of non-delivered orders, CSV export, and existing fulfillment flows.

Users: role, account status, feature restrictions, tags, and authorized CSV export.

Inventory: status changes, deletion of unused stock, and approval-gated export.

Coupons/customer tags: preview-first active-state and tag operations through the shared endpoint.

## Safety behavior

Explicit selections are deduplicated and bounded at 500 records for products, users, and stock; orders retain their existing 200-record bound. Product mutations now write admin audit entries with action, actor, requested count, selected IDs, and operation details. Sensitive inventory exports continue to use the existing approval flow, and credentials/secrets are excluded from bulk operations.

No schema migration, dependency, production configuration, or deployment was introduced.
