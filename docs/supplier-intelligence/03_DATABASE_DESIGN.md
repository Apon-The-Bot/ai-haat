# Database design

Existing `Supplier`, `ProductSupplier`, `InventoryBatch`, `DigitalStock`, `OrderItemCost`, `ProviderCatalogSnapshot`, and `ProviderCatalogSync` models cover current mappings, stock, cost snapshots, and catalog sync history. No migration is introduced by this foundation phase. A future canonical-offer table must include supplier/product/variant identity, source timestamp, currency, normalized cost, availability, mapping confidence, and audit metadata.
