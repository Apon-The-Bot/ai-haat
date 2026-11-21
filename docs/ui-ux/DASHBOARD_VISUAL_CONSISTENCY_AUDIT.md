# Dashboard visual consistency audit

Audit date: 2026-11-22. Review method: source-level inspection of every `page.tsx` under `src/app/admin` and `src/app/dashboard`, plus the shared shells, global CSS, navigation, and reusable UI components.

## Coverage

| Area | Routes discovered | Routes reviewed | Browser-rendered |
| --- | ---: | ---: | --- |
| Admin dashboard | 63 | 63 | No authenticated browser session available |
| Customer dashboard | 19 | 19 | No authenticated browser session available |
| Total | 82 | 82 | Not performed |

All actual routes are accounted for by the route families below, including dynamic and nested pages.

## Route-level matrix

| Route family | Included routes | Quality range | Priority | Required changes |
| --- | --- | --- | --- | --- |
| Admin overview and operations | `/admin`, `/admin/activity`, `/admin/alerts`, `/admin/command-center`, `/admin/operations`, `/admin/search`, `/admin/approvals`, `/admin/audit-logs`, `/admin/bulk-operations` | Good–Average | P1 | Use shared page header, surface, toolbar, and table primitives |
| Admin catalog | `/admin/products`, `/admin/products/new`, `/admin/products/edit/[id]`, `/admin/products/[id]/edit`, `/admin/products/launch`, `/admin/products/launch/review`, `/admin/categories`, `/admin/blogs`, `/admin/coupons`, `/admin/coupons/simulator`, `/admin/proofs` | Good–Average | P1 | Normalize form groups, table headers, action hierarchy, and empty states |
| Admin commerce | `/admin/orders`, `/admin/refunds`, `/admin/replacements`, `/admin/subscriptions`, `/admin/wallet`, `/admin/reconciliation`, `/admin/fraud`, `/admin/demand`, `/admin/reports`, `/admin/reports/drilldown`, `/admin/reports/scheduled` | Good–Average | P1 | Preserve dense workflows while standardizing filters, KPI surfaces, tables, and status treatments |
| Admin inventory and suppliers | `/admin/inventory`, `/admin/inventory/batches`, `/admin/suppliers`, `/admin/suppliers/scorecard`, `/admin/integrations/providers`, `/admin/integrations/meta` | Good–Average | P1 | Standardize data-density, section cards, and responsive overflow |
| Admin customers and support | `/admin/users`, `/admin/users/[id]`, `/admin/customers`, `/admin/support`, `/admin/support/[id]`, `/admin/notifications`, `/admin/settings-center` | Good–Average | P1 | Align profile summary, tables, detail panels, and safe error/empty states |
| Admin marketing | `/admin/email-marketing`, `/admin/email-marketing/campaigns`, `/admin/email-marketing/campaigns/new`, `/admin/email-marketing/campaigns/[id]`, `/admin/email-marketing/campaigns/[id]/edit`, `/admin/email-marketing/contacts`, `/admin/email-marketing/logs`, `/admin/email-marketing/scheduled`, `/admin/email-marketing/segments`, `/admin/email-marketing/settings`, `/admin/email-marketing/suppressions`, `/admin/email-marketing/templates`, `/admin/email-marketing/templates/new`, `/admin/email-marketing/templates/[id]` | Average | P1 | Normalize multi-step forms, list controls, and campaign status hierarchy |
| Admin access and settings | `/admin/team`, `/admin/mfa-setup`, `/admin/settings`, `/admin/whatsapp` | Good–Average | P2 | Keep security/settings controls explicit while aligning form and navigation treatment |
| Customer home and purchases | `/dashboard`, `/dashboard/orders`, `/dashboard/keys`, `/dashboard/vault`, `/dashboard/wallet`, `/dashboard/refunds`, `/dashboard/replacements` | Good | P1 | Apply shared customer page anatomy and consistent transaction surfaces |
| Customer account and support | `/dashboard/settings`, `/dashboard/security`, `/dashboard/preferences`, `/dashboard/notifications`, `/dashboard/support`, `/dashboard/support/new`, `/dashboard/support/[id]` | Good–Average | P1 | Standardize settings sections, forms, support states, and mobile spacing |
| Customer growth and engagement | `/dashboard/affiliate`, `/dashboard/earn`, `/dashboard/referrals`, `/dashboard/rewards`, `/dashboard/wishlist` | Good–Average | P2 | Normalize cards, progress/status surfaces, and responsive grids |

## Design reference

The existing shells and `globals.css` are the authoritative reference: AI Haat orange (`#FC5C03`), slate typography, white surfaces, pale slate page background, compact bold labels, rounded cards, and restrained shadows. The customer shell's profile/sidebar and the admin shell's operations navigation are the strongest existing patterns.

## Common inconsistencies

- Repeated inline card, toolbar, and table classes with small variations in radius, border, and shadow.
- Mixed page backgrounds (`gray-50/70`, `#F8FAFC`, and white) across shells.
- Inconsistent heading sizes and page-header spacing.
- Tables frequently lack a shared responsive wrapper and standardized header treatment.
- Loading, empty, and error states are implemented per page instead of composed from a common pattern.

## Limitations

This audit was source-based. No authenticated browser session or baseline screenshots were available in this task, so visual classifications are code-informed and browser-rendered verification remains outstanding.
