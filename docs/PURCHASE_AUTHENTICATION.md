# Purchase authentication

Guests can browse the storefront, search, view product details, and edit their cart. The cart page and drawer open Google sign-in at Checkout. Product cards, product details, and the comparison screen use the shared Buy Now provider. Direct checkout requests redirect to sign-in on the server and preserve checkout query parameters.

## Entry points and enforcement

| Entry point | Enforcement |
| --- | --- |
| `/checkout` | Verified server session required. Account restrictions apply before rendering checkout. |
| `POST /api/orders` | Session, same-origin check, purchase entitlement, canonical buyer ID and email, server quote, and database persistence. Renewal references must belong to the buyer. |
| `GET /api/orders` | Account ownership for linked orders. The authenticated email lookup remains available for unlinked historical records. Public tracking remains a restricted status view. |
| `POST /api/payment/create` | Session and same-origin check. Store orders must be payable and owned by the buyer. Amount and order reference come from the database. Wallet gateway top-ups receive server-generated references and session-bound metadata. |
| `POST /api/wallet/purchase` | Session, wallet entitlement, order ownership, and an atomic debit and payment transition. |
| `POST /api/wallet/recharge` | Existing session and same-origin guard. Manual wallet approvals stay behind the existing admin MFA boundary. |
| `POST /api/gift-cards/create` | Session, same-origin check, purchase entitlement, and an atomic wallet debit, ledger entry, and gift card issue. |
| `POST /api/gift-cards/redeem` | Existing session guard. |
| `/gift/[token]` and `/api/gift/claim/[token]` | Session and matching recipient email when the gift specifies one. A verified and delivered gift is required before credentials are included. |
| `/checkout/success` | Displays payment state from an authenticated order read. URL query parameters cannot mark a purchase paid. |
| `/api/payment/callback` and `/api/payment/webhook` | Server-to-server provider verification, provider-supplied order reference, amount check, and atomic payment transition. These endpoints remain independent of the buyer's browser session. |
| `/api/admin/deliver`, `/api/admin/send-delivery-email`, and `/api/admin/orders/auto-fulfill` | Admin MFA. Delivery requires a verified account-owned order. Manual delivery stores encrypted credentials and sends to the order's stored address. |
| `PATCH /api/orders` and `/api/admin/orders/bulk` | Admin MFA. Verify payment separately before marking an account-owned order delivered. |
| `/api/vault/credentials` | Existing authenticated vault. |

## Cart and sign-in

The cart already uses browser local storage, with a single cart per browser profile. The cart provider now waits for restoration before writing. Google sign-in preserves that cart in the same browser, so there is no account-side cart merge. The selected coupon travels in the checkout URL and is revalidated against the restored cart. A pending Buy Now stores the product, variation, quantity, and return path in the same tab for 30 minutes. The product is fetched again after sign-in. An expired session at order submission prompts sign-in again.

## Payment and fulfillment

Store orders are tied to the session's database user ID. Payment initiation cannot use an email match as proof of ownership. A provider transaction is checked against the order reference and payable amount before updating payment status. Competing callbacks can only transition a pending order once. Automated fulfillment checks ownership and verified payment and serializes delivery for the order. Historical orders stay in place. Existing unlinked records can be read through the historical order path and cannot begin a new payment or delivery.

Manual gift card purchases now use wallet funds. This removes the prior path that issued active gift card credit without payment. Manual order delivery uses the existing credential encryption configuration and requires `MFA_ENCRYPTION_KEY`.

## Verification

- `node scripts/test-auth-boundaries.mjs` passed with mocked database and gateway dependencies. It verified direct checkout redirect and coupon/renewal preservation, authenticated checkout rendering, rejection of guest order/payment/gift/delivery calls, cross-origin payment rejection, rejection of foreign and unlinked orders, canonical checkout identity and amount, gift card funding responses, webhook metadata enforcement, and one fulfillment trigger across duplicate verified webhook calls without a browser session.
- `npm run typecheck` passed. `npm run lint` passed with repository warnings. `npm run build` passed in an isolated copy with fixture configuration. `npm run architecture:check` reported 111 files above the 300-line limit.
- Desktop and mobile browser runs were blocked by the execution policy rejecting startup of the isolated local Next.js server. Real Google OAuth, live PipraPay, database concurrency, and full browser cart restoration still need staging verification. Database-writing legacy audit scripts were excluded from this run.

## Modified files

| Files | Change |
| --- | --- |
| `src/app/checkout/page.tsx`, `src/app/checkout/success/page.tsx` | Server checkout gate and authenticated order status |
| `src/app/login/page.tsx`, `src/components/AuthModal.tsx`, `src/lib/security/auth-return.ts` | Validated internal OAuth return |
| `src/context/CartContext.tsx`, `src/components/cart/CartPageClient.tsx`, `src/components/checkout/CheckoutPageClient.tsx` | Cart hydration, coupon transfer and revalidation, and session-expiry handling |
| `src/context/QuickCheckoutContext.tsx`, `src/components/checkout/QuickCheckoutModal.tsx` | Buy Now login and restoration |
| `src/app/api/orders/route.ts`, `src/app/api/wallet/purchase/route.ts` | Session-owned orders, renewal validation, and wallet payment ownership |
| `src/app/api/payment/create/route.ts`, `src/app/api/payment/callback/route.ts`, `src/app/api/payment/webhook/route.ts` | Verified buyer and provider bindings |
| `src/app/gift-cards/page.tsx`, `src/app/api/gift-cards/create/route.ts`, `src/lib/gifting/gift-cards.ts` | Account-owned wallet-funded gift cards |
| `src/app/gift/[token]/page.tsx`, `src/app/api/gift/claim/[token]/route.ts`, `src/lib/gifting/product-gifting.ts` | Authenticated product gift claims |
| `src/app/admin/orders/page.tsx`, `src/app/api/admin/deliver/route.ts`, `src/app/api/admin/send-delivery-email/route.ts`, `src/app/api/admin/orders/bulk/route.ts`, `src/lib/commerce/inventory.ts` | Verified payment before delivery and serialized fulfillment |
| `scripts/test-auth-boundaries.mjs`, `scripts/test-comprehensive-audit.ts`, `scripts/test-digital-gifting-e2e.ts` | Fixture boundary coverage and updated legacy script call signatures |
