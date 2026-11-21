# Inventory integration

Supplier-authenticated ingestion and batch stock are already implemented in `src/lib/commerce/suppliers.ts` and Prisma inventory models. The intelligence layer is advisory only and does not write stock or bypass existing ingestion authorization.
