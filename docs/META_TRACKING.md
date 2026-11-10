# AI Haat Meta tracking

## Hostinger setup

1. Apply the reviewed `20261110_meta_tracking` Prisma migration to the existing MySQL schema using the project's production migration procedure. Generate the Prisma client from the updated schema as part of deployment. The migration adds nullable order tracking fields, an advertising consent table and an outbox scheduling index.
2. Keep the existing `MFA_ENCRYPTION_KEY` and `CRON_SECRET` in Hostinger's server environment. The old Meta Pixel, CAPI token and test-code environment variables are no longer read. Keep the existing vault key when deploying. The key also protects MFA data.
3. Configure the Hostinger scheduler to send an HTTPS `POST` to `https://aihaat.shop/api/analytics/retry` every minute, with the `Authorization: Bearer <CRON_SECRET>` header. Source the header value from the scheduler's secure environment. Confirm a 200 response and monitor outbox status in the admin page.
4. With an MFA-verified admin account, open **Admin → Meta Tracking**. Enter the Dataset ID and CAPI token. Copy the Test Events code from Meta Events Manager, enable test mode and save. **Test Meta connection** sends one synthetic event after confirmation. Verify receipt under **Test Events**.
5. Disable test mode and enable the desired channels. Use a consented staging browser and a verified staging payment to check browser and server event matching in Events Manager. Confirm that rejecting or withdrawing advertising consent stops both channels. No source edits are needed for routine dataset, token or event changes.

The app defaults to disabled tracking and the configurable v26.0 API selection. See the [Meta SDK releases](https://github.com/meta/facebook-nodejs-business-sdk/releases) and [Meta CAPI request implementation](https://github.com/meta/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/event-request.js). Provider acceptance indicates receipt. Attribution, Event Match Quality, and cross-channel deduplication percentages are measured by Meta.

## Event mapping

| Event | Evidence | Channel and parameters |
| --- | --- | --- |
| PageView | Eligible initial and SPA navigation, deduplicated by page URL | Pixel |
| ViewContent | Product detail view | Pixel with product, category, value and currency |
| Search | Debounced catalog search with sensitive terms filtered | Pixel with search term |
| AddToCart | Successful local cart mutation, including guest carts | Pixel with product/variant, quantity, value and currency |
| RemoveFromCart | Removal of an existing cart item | Custom Pixel event |
| InitiateCheckout | Authenticated cart checkout or Buy Now with a validated server quote | Pixel with quoted contents, item count, BDT value |
| Purchase | Verified account-owned order with advertising consent captured at order placement | Pixel and CAPI, independently enabled. Uses the paid order total, historical line prices, contents, order number and shared event ID |
| CompleteRegistration | Canonical account newly created by verified Google sign-in | Pixel with no customer fields |
| Lead | Product request accepted by the backend | Pixel with no request details |

Payment method selection alone does not emit Meta AddPaymentInfo. The storefront does not have a verified wishlist or separate subscription enrollment transition to track. The support-ticket form currently simulates submission, so it does not emit Contact.

## Architecture and operations

- **Configuration** lives in a dedicated `SiteSetting` record. MFA guards settings, diagnostics and connection tests. Mutations enforce same-origin and rate limits, use an audit record, and never return the saved token or test code. The token uses AES-256-GCM with the existing server encryption key. To rotate a Meta token, save its replacement for the same dataset, test it and revoke the superseded token after the new credential is verified. Rotation of the shared encryption key requires migrating the other vault and MFA ciphertext before changing the key. Keep the existing key and database backup together in controlled recovery storage.
- **Pixel** initializes a single async loader on eligible URLs with advertising consent. Commands target the configured dataset and automatic event configuration is disabled. The public endpoint returns an allowlisted projection with a 10-second per-process cache and local invalidation. Visible tabs refresh configuration every 30 seconds. Native Pixel URL capture is why sensitive paths and unknown query parameters are excluded. On success pages only the order reference and enumerated status are allowed.
- **Privacy** separates advertising and analytics choices from essential cookies. The browser preference identifies a revocable, expiring database consent. Orders only snapshot Meta click identifiers and a bounded user agent from the original checkout request after a valid advertising grant. Revocation clears matching order attribution and cancels eligibility for unsent events. Other open tabs pick up the change on their next preference refresh. Existing in-flight provider requests cannot be recalled. The app never uses payment provider request metadata as browser attribution. Optional advanced matching sends hashed normalized customer data only when enabled at queue time and delivery. The scheduler purges new Meta outbox rows and stored order attribution after 30 days.
- **Purchase** is queued by gateway callback, webhook, wallet payment or trusted admin verification after the paid update succeeds. The browser reads a paid order owned by the signed-in buyer and a matching consented, dataset-bound receipt. It cannot submit a purchase to CAPI. Both channels use `purchase_<orderNumber>` and the same normalized data. The browser remembers the event in session storage to prevent repeat dispatch on refresh in the same tab. Amount is the order total after discounts in BDT. Line prices are historical and refunds do not produce another Purchase. No CAPI requests run on the payment path.
- **Outbox** uses the unique event ID and a time-bound claim to prevent competing workers from normally sending the same row concurrently. Transient errors retry with the same event ID and original timestamp, up to four attempts. Each cron call processes up to six rows sequentially with a four-second provider timeout per row. Rows older than 24 hours, with invalid orders or consent, or pinned to another dataset are suppressed. Old pre-consent queue entries are excluded. A process crash between the committed payment update and the outbox insert can leave a purchase unqueued. Tracking failure is deliberately independent of the payment transaction.
- **Diagnostics** report local purchase receipts, attempts, sanitized errors, and acceptance timestamps. Browser delivery and attribution are verified in Events Manager. The connection test is synthetic and test mode pauses production events. No production Purchase is relabeled with a test code.

## Verification

The fixture tests cover secret encryption and public/admin masking, invalid configuration, guest and foreign access restrictions, browser consent and duplicate PageView, validated Purchase payloads, browser/server event name and ID matching, duplicate purchase queueing, transient retries, dataset switching and consent withdrawal. They do not contact Meta or use customer data.

`npm run typecheck`, `npm run lint` (with repository warnings), Prisma schema validation, the auth boundary suite and the Meta fixtures passed. The existing analytics suite passed 36 assertions. The isolated production build passed and reported 102 kB shared first-load JavaScript. A scan of its browser assets found none of the server encryption key, legacy token environment variable or token ciphertext field names. The architecture check still flags 109 files above the repository's 300-line limit.

No production migration, cron configuration, Meta connection test, real purchase, browser Pixel request, or production performance measurement was performed. Actual Meta acceptance, browser/mobile behavior, database concurrency and event deduplication in Events Manager remain staging checks. CAPI-only orders with neither usable click identifiers nor permitted advanced matching are suppressed and visible in diagnostics.

## Changed areas

| Area | Files |
| --- | --- |
| Schema | `prisma/schema.prisma`, `prisma/migrations/20261110_meta_tracking/migration.sql` |
| Admin and preferences | `src/app/admin/integrations/meta/page.tsx`, `src/app/api/admin/integrations/meta/route.ts`, `src/components/admin/AdminLayoutClient.tsx`, `src/app/api/analytics/meta/route.ts`, `src/app/privacy/page.tsx`, `src/lib/legal/documents.ts` |
| Browser | `src/components/Providers.tsx`, `src/components/analytics/AnalyticsProvider.tsx`, `PageViewTracker.tsx`, `PurchaseTracker.tsx`, `RegistrationTracker.tsx`, `useMetaCheckout.ts`, `src/lib/analytics/client.ts`, `attribution.ts`, `meta-browser.ts`, `src/context/CartContext.tsx`, checkout clients, `src/components/product-request/ProductRequestClient.tsx` |
| Server | `src/lib/analytics/meta-settings.ts`, `meta-events.ts`, `meta-consent.ts`, `meta-purchase.ts`, `meta-capi.ts`, `meta-delivery.ts`, `server.ts`, `types.ts`, `src/lib/auth.ts`, analytics quote/receipt/retry routes, order creation, gateway callbacks, wallet payment and admin order verification |
| Tests | `scripts/test-meta-tracking.mjs`, `scripts/test-analytics-suite.ts`, `scripts/test-auth-boundaries.mjs` |
