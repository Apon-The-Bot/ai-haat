# Master architecture

The existing provider catalog and supplier inventory paths remain the system of record. The new `src/lib/supplier-intelligence` package is a pure, side-effect-free decision layer: normalization → matching → eligibility filtering → deterministic lowest-cost selection.

Automated purchasing, canonical offer persistence, background orchestration, and order mutation are intentionally not enabled until supplier order APIs and credentials are verified.
