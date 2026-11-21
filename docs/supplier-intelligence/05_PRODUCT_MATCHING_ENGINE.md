# Product matching engine

The foundation engine normalizes Unicode/text aliases, compares critical attributes, detects hard conflicts, and combines attribute confidence with token Jaccard similarity. It returns `VERIFIED_MATCH`, `HIGH_CONFIDENCE`, `NEEDS_REVIEW`, or `NO_MATCH`; it does not silently create product mappings.
