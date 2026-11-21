# Supplier selection

`selectLowestEligibleOffer` excludes disabled suppliers, invalid costs, unverified mappings, unsupported fulfillment, out-of-stock offers, stale availability when requested, and low-reliability suppliers. Eligible offers are ordered by effective BDT cost, reliability, then stable supplier id.
