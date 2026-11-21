# Admin bulk-actions audit

Audit date: 2026-11-22. Scope: all route groups under `src/app/admin` and matching handlers under `src/app/api/admin`.

## Inventory and decision matrix

| Module reviewed | Existing bulk capability | Priority | Decision / risk |
| --- | --- | --- | --- |
| Products | Select filtered in-memory rows; status, visibility, archive/delete, price, CSV | P0 | Implemented; price and delete remain confirmation-protected |
| Orders | Select rows; status, cancel, CSV, eligible fulfillment actions | P0 | Implemented; payment/delivery guards retained |
| Users/customers | Select rows; role, account status, restriction, tags, CSV | P0 | Implemented; MFA required for privileged changes |
| Inventory / digital stock | Select stock; status, delete unused stock, approved export | P0 | Implemented; delivered/replaced stock is protected |
| Coupons | Preview/commit active-state mutation | P1 | Implemented through shared bulk endpoint |
| Categories | Single-record management | P2 | No safe repeated mutation identified in current UI |
| Inventory batches | Batch/import workflows | P1 | Reviewed; no generic bulk mutation added without batch-specific business rules |
| Support tickets | Individual ticket/message workflow | P1 | No bulk endpoint currently exists; assignment/status semantics need product decision |
| Reviews/moderation | No admin review table/endpoint discovered | Not appropriate | Not implemented |
| Subscriptions | Reporting/lifecycle view | P1 | No bulk lifecycle mutation; financial and entitlement side effects require a dedicated workflow |
| Suppliers/integrations/bots | Individual configuration and sync actions | P2 | Credentials and critical-service state excluded |
| Email marketing | Campaign, contact, segment, suppression workflows | P1 | Contact import exists; mass send is intentionally not exposed as a generic bulk action |
| Affiliates/payouts/wallet/refunds | Individual financial approvals and adjustments | Not appropriate | Bulk financial mutation rejected; export/reporting remains the safer path |
| Notifications/alerts/activity/audit logs | Read-only or operational views | P2 | No generic destructive bulk action added |
| Blogs/content/proofs | Individual content workflows | P2 | No consistent multi-record state contract discovered |
| Reports/reconciliation/fraud/approvals | Analysis, review, or approval workflows | P1 | Bulk mutation would bypass case-level review; not added |
| WhatsApp | Account/message operations | Not appropriate | No bulk send; consent and live-message safety prohibit generic bulk action |
| Team/settings/MFA | Access and configuration | Not appropriate | Privilege/configuration changes remain individual |

## Shared findings

The application already had a reusable `BulkActionBar`, module-specific selection state, and a preview/digest/commit endpoint at `/api/admin/bulk-operations`. The audit found that selection is page/filter-local in the current client tables; cross-page “all matching” selection is therefore not claimed or enabled. Server endpoints validate explicit IDs and enforce MFA through the existing auth guard.

P0/P1 work that is safe under existing domain contracts is implemented in products, orders, users, inventory, coupons, and customer tags. The remaining exclusions are documented blockers, not assumed support.
