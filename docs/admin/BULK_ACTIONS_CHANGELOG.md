# Bulk actions changelog

## 2026-11-22

- Audited all admin route groups and existing bulk endpoints.
- Added bounded, deduplicated ID validation to product, user, and inventory bulk APIs.
- Added product bulk audit logging through the existing `logAdminAudit` infrastructure.
- Documented implemented coverage, exclusions, security constraints, and unverified QA areas.
- No database migration, new dependency, production change, or deployment.
