# Dependency map

The preferred request path is:

`route handler/page -> feature component or request validator -> domain/service -> Prisma or external integration -> audit/response`

Rules:

- Routes own HTTP parsing, authentication/authorization invocation, status codes, and response serialization.
- Domain services own business invariants and transaction boundaries.
- Prisma and external clients stay server-only and are not imported by client components.
- Shared utilities must remain route-independent and side-effect explicit.
- Payment, auth, database, and WhatsApp changes require targeted regression evidence.
- Avoid broad barrel exports; import from the owning module to keep dependency direction visible.
