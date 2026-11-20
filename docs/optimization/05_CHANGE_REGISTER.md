# Change register

OPT-01 updates `scripts/check-source-file-length.mjs` and adds `docs/refactoring/source-length-baseline.txt`. The files here record evidence. Remove a listed exception when its file comes under the limit. To roll back the local batch, reverse only its diff relative to `bbf69ad` after reviewing overlap with later edits. No database or deployment rollback applies.

OPT-04 changes `src/app/api/health/route.ts` to read RSS and heap usage from one snapshot. Roll back by reversing only that route's OPT-04 hunk and its evidence entries. Preserve the earlier checker changes.

OPT-05 changes only the date formatting scope in `src/app/admin/subscriptions/page.tsx`. Roll back the route hunk independently of prior batches.

OPT-06 changes `src/components/AppShell.tsx`. Reverse its hunk to restore the eager import independently of earlier batches.

OPT-06 recovery also lives in AppShell. It replaces the React lazy wrapper with a caught on-demand import and a loading, cancel and retry control. Keep recovery with deferral or roll back both to the eager import.

OPT-07 modifies only `src/app/product/[slug]/page.tsx`. Revert its React cache import, wrapper and two call-site edits to restore the prior behavior independently.

OPT-08 modifies only `src/lib/products-db.ts`. Revert the tally helper and restore the per-variation filter at both call sites to roll back.

OPT-09 narrows two stock projections in the same module. Restore `id: true` at both call sites to roll back independently of the tally.

OPT-10 adds dialog semantics and keyboard focus handling in `src/components/checkout/QuickCheckoutModal.tsx` and clears pending state after wallet success. Revert that file's OPT-10 diff to roll back independently of the deferred loader.
