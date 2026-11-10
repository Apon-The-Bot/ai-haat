# 01 — COMPLETE USER FEATURE INVENTORY & COVERAGE REGISTRY

## 1. Executive Summary

This inventory catalogs every actual customer-facing feature in AI Haat, mapping its frontend entry point, backend API, backing database models, user permissions, business rules, financial implications, and administrative controls.

---

## 2. Granular Feature Inventory Matrix

### Group A: Shopping & Commerce
| Feature Key | Feature Name | Frontend Route | Backend API | Database Models | Business Rules & Financial Impact | Admin Oversight & Control |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SHOPPING_BROWSE` | Product Catalog Browsing | `/`, `/shop`, `/product/[slug]` | `/api/products` | `Product`, `Variation`, `Category` | Zero financial impact. Read-only exploration. | Can restrict access to force login or block scrapers. |
| `SHOPPING_CART` | Shopping Cart Management | Header drawer, `/cart` | Local client storage / Cart context | Client state | Calculates subtotal, volume discounts. | Can restrict adding items to cart. |
| `SHOPPING_CHECKOUT` | Checkout Initiation | `/checkout` | `/api/checkout/validate` | `Order`, `OrderItem` | Locks inventory quotas for 15 minutes. | Can disable checkout access. |
| `SHOPPING_PURCHASE` | Order Placement | `/checkout` submit | `POST /api/orders` | `Order`, `OrderItem`, `DigitalStock` | Direct financial commitment. Ingests payment info (MFS/Card). | Granular toggle + per-transaction spending limit. |
| `SHOPPING_INVOICE` | Tax Invoice Access | Order Success, `/dashboard/orders` | `/api/orders/[id]/invoice` | `Order` | Verifies purchase receipt. Generates signed PDF. | Can restrict invoice access for disputed transactions. |

### Group B: Financial & Wallet
| Feature Key | Feature Name | Frontend Route | Backend API | Database Models | Business Rules & Financial Impact | Admin Oversight & Control |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `WALLET_ACCESS` | Wallet Dashboard | `/dashboard/wallet`, `/wallet` | `/api/wallet/transactions` | `User`, `WalletTransaction` | Displays real-time balance and transaction history. | Toggle visibility and access. |
| `WALLET_PAYMENT` | Balance Checkout | Checkout payment selector | `POST /api/wallet/purchase` | `User`, `Order`, `WalletTransaction` | Instant atomic debit from `walletBalanceBDT`. Zero payment gateway fee. | Full toggle + daily spending limit. |
| `WALLET_TOPUP` | MFS Balance Recharge | `/dashboard/wallet/recharge` | `POST /api/wallet/recharge` | `WalletTransaction` | Requires bKash/Nagad/Rocket transaction verification. | Restrict recharge capability on fraud suspect accounts. |
| `REFUND_REQUEST` | Order Dispute / Refund | `/dashboard/refunds` | `POST /api/refunds` | `Refund`, `Order` | Customer requests balance refund. Subject to admin review. | Enable or disable self-service refund requests. |

### Group C: Digital Goods & Delivery
| Feature Key | Feature Name | Frontend Route | Backend API | Database Models | Business Rules & Financial Impact | Admin Oversight & Control |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DIGITAL_LICENSE` | License Key View | `/dashboard/keys`, Order Success | `/api/orders/[id]/keys` | `DeliveredKey`, `DigitalStock` | Customer views software license keys. | Mask/unmask, revoke license key. |
| `DIGITAL_CREDENTIALS` | Shared Account Credentials | `/dashboard/keys` | `/api/orders/[id]/keys` | `DeliveredKey` | Displays shared profile login credentials. | Masked reveal with mandatory administrative audit log. |
| `DIGITAL_DOWNLOAD` | Protected Downloads | `/dashboard/keys/downloads` | `/api/downloads/[id]` | `DigitalStock` | Secure download URL with signed token. | Invalidate token or revoke download access. |
| `DIGITAL_VAULT` | Personal Vault | `/dashboard/vault` | `/api/vault/credentials` | `DeliveredKey` | Encrypted personal archive for purchased keys. | Restrict vault access. |
| `GIFT_CLAIM` | Gift Unboxing & Claim | `/gift/[token]` | `/api/gifts/[token]/claim` | `GiftCard`, `Order` | Unboxes digital gift and delivers entitlement. | Cancel or freeze gifted tokens. |
| `REPLACEMENT_REQUEST` | Warranty Replacements | `/dashboard/replacements` | `POST /api/replacements` | `ReplacementRequest` | Automates warranty key replacement under valid SLA. | Restrict replacement abuse. |

### Group D: Rewards & Growth
| Feature Key | Feature Name | Frontend Route | Backend API | Database Models | Business Rules & Financial Impact | Admin Oversight & Control |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REWARDS_COUPON` | Promo Coupon Usage | Cart, `/checkout` | `POST /api/coupons/validate` | `Coupon`, `Order` | Discounts order total by flat BDT or percentage. | Restrict coupon usage per user. |
| `REWARDS_COINS` | Loyalty Coins | Checkout coins toggle | `POST /api/coins/redeem` | `CoinTransaction`, `User` | Converts loyalty coins to instant balance discount. | Restrict coin earning or redemption. |
| `REWARDS_REFERRAL` | Affiliate Program | `/dashboard/affiliate` | `GET/POST /api/affiliate/*` | `AffiliateProfile`, `ReferralClick` | Tracks referral clicks and commissions. | Suspend affiliate tier or freeze commission payouts. |

### Group E: Support & Communications
| Feature Key | Feature Name | Frontend Route | Backend API | Database Models | Business Rules & Financial Impact | Admin Oversight & Control |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SUPPORT_TICKETS` | Support Desk | `/dashboard/support` | `/api/support/tickets` | `SupportTicket`, `SupportMessage` | Customer ticketing and live agent communication. | Restrict ticket creation on spamming. |
| `PRODUCT_REQUEST` | Request Digital Product | `/product-request` | `POST /api/product-request` | `ProductRequest` | Lead generation for unlisted digital goods. | Restrict submission on abusive requests. |
| `STOCK_WAITLIST` | Restock Notifications | Out of stock product pages | `POST /api/stock-waitlist` | `StockWaitlist` | Email alerts when digital inventory is replenished. | Restrict waitlist subscription. |

### Group F: Account & Identity
| Feature Key | Feature Name | Frontend Route | Backend API | Database Models | Business Rules & Financial Impact | Admin Oversight & Control |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ACCOUNT_PROFILE_EDIT` | Profile Management | `/dashboard/preferences` | `PATCH /api/user/preferences` | `User` | Updates customer name, phone, or avatar. | Full admin edit with duplicate checks and audit trail. |
| `ACCOUNT_PASSWORD_RESET`| Password & 2FA Recovery | `/auth/verify/recovery` | `/api/auth/recovery` | `UserSecurity` | Account recovery and password rotation. | Force reset, invalidate sessions, require MFA re-enrollment. |
