# AI HAAT — FEATURE POLICY & GRANULAR RESTRICTION ENGINE
**Document ID:** REPORT-05  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Architecture and operation of the 23-feature granular permission engine, policy resolution hierarchy, spending limits, and Restriction Impact Simulator.

---

## 1. Executive Summary

The AI Haat Feature Policy Engine provides fine-grained, dynamic access control over every legitimate customer interaction on `aihaat.shop`. Rather than relying on coarse all-or-nothing bans, administrators can apply surgical restrictions to specific capabilities (e.g. disable wallet top-ups while permitting digital product downloads, or cap order spending without disabling checkout).

---

## 2. The 23 System Features Registry

The platform registers 23 distinct operational capabilities divided across 6 functional domains:

| # | Feature Key | Domain | Description | Default State |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `AUTH_LOGIN` | Identity | Standard email and password login | `ACTIVE` |
| 2 | `AUTH_REGISTER` | Identity | New customer account registration | `ACTIVE` |
| 3 | `AUTH_PASSWORD_RESET`| Identity | Password reset requests via email token | `ACTIVE` |
| 4 | `AUTH_TWO_FACTOR` | Identity | Two-factor authentication setup & verify | `ACTIVE` |
| 5 | `PROFILE_UPDATE` | Account | Modifying profile name, avatar, bio | `ACTIVE` |
| 6 | `PROFILE_PASSWORD_CHANGE`| Account | Changing existing password in settings | `ACTIVE` |
| 7 | `PROFILE_EMAIL_CHANGE`| Account | Initiating email address change | `ACTIVE` |
| 8 | `PROFILE_DELETE` | Account | Self-service account deletion request | `ACTIVE` |
| 9 | `SHOPPING_CART` | Commerce | Adding items to shopping cart | `ACTIVE` |
| 10 | `SHOPPING_PURCHASE`| Commerce | Placing new orders & checkout | `ACTIVE` |
| 11 | `SHOPPING_REVIEWS` | Commerce | Submitting customer product ratings | `ACTIVE` |
| 12 | `DIGITAL_DOWNLOADS`| Fulfillment| Downloading delivered digital files | `ACTIVE` |
| 13 | `LICENSE_KEYS` | Fulfillment| Accessing license keys & credentials | `ACTIVE` |
| 14 | `WALLET_TOPUP` | Financial | Depositing funds via bKash/Nagad/Cards | `ACTIVE` |
| 15 | `WALLET_PAYMENT` | Financial | Paying for orders using wallet balance | `ACTIVE` |
| 16 | `WALLET_TRANSFER` | Financial | Peer-to-peer balance transfer (if enabled)| `ACTIVE` |
| 17 | `SUPPORT_TICKETS` | Support | Opening new customer support tickets | `ACTIVE` |
| 18 | `SUPPORT_LIVE_CHAT`| Support | Real-time chat with support agents | `ACTIVE` |
| 19 | `NOTIFICATIONS` | Comms | Receiving marketing & order alerts | `ACTIVE` |
| 20 | `API_ACCESS` | Developer | Accessing public/partner REST endpoints | `ACTIVE` |
| 21 | `RESELLER_PORTAL` | Partner | Accessing bulk reseller discounting tools| `ACTIVE` |
| 22 | `AFFILIATE_PROGRAM`| Partner | Generating referral links & commissions| `ACTIVE` |
| 23 | `COMMUNITY_FORUM` | Social | Participating in discussions & comments | `ACTIVE` |

---

## 3. Policy Resolution Precedence Hierarchy

When a user attempts an action, `checkFeatureEntitlement(userId, featureKey, context)` computes the effective entitlement by evaluating policies in strict descending priority:

```
                    ┌─────────────────────────────────┐
                    │ Request Action (e.g. Purchase)  │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                     [ 1. Is User Permanently Banned? ]
                             │               │
                            YES              NO
                             │               ▼
                             │    [ 2. Is User Suspended? ]
                             │            │         │
                             │           YES        NO
                             │            │         ▼
                             │            │  [ 3. Explicit User Restriction? ]
                             │            │          │               │
                             │            │      DISABLED            │
                             │            │          │           READ_ONLY
                             │            │          │               │
                             │            │          │          LIMIT_USAGE
                             │            │          │               │
                             ▼            ▼          ▼               ▼
                        [ DENIED ]   [ DENIED ]  [ DENIED ]   [ Evaluate Limit ]
                                                                     │
                                                              Pass / Fail
                                                                     │
                                                                     ▼
                                                             [ Default: ALLOWED ]
```

### Precedence Rules:
1. **Permanent Ban (`BANNED`):** Overrides all features. Every feature is unconditionally denied (`allowed: false`).
2. **Temporary Suspension (`SUSPENDED`):** Overrides all mutating and transactional features. Only read-only profile access is permitted.
3. **Explicit Feature Restriction:**
   - `DISABLED`: Complete denial of the specific capability.
   - `READ_ONLY`: User can view existing records (e.g. view existing license keys) but cannot generate new ones.
   - `LIMIT_USAGE`: Permitted only if the requested transaction amount/count does not exceed `limitValue`.
4. **Default:** Feature is active and permitted.

---

## 4. Enforcement Examples in Production Routes

### 4.1 Order Placement Guard (`src/app/api/orders/route.ts`)
```typescript
// Verify customer is entitled to make purchases
const purchaseEntitlement = await checkFeatureEntitlement(session.user.id, 'SHOPPING_PURCHASE', {
  amount: orderTotalBDT,
});

if (!purchaseEntitlement.allowed) {
  return NextResponse.json(
    {
      error: 'Purchase Restricted',
      message: purchaseEntitlement.reason || 'Purchases are currently restricted on your account.',
      restrictionType: purchaseEntitlement.restrictionType,
    },
    { status: 403 }
  );
}
```

### 4.2 Wallet Payment Guard (`src/app/api/wallet/purchase/route.ts`)
```typescript
// Verify customer is entitled to spend wallet balance
const walletEntitlement = await checkFeatureEntitlement(session.user.id, 'WALLET_PAYMENT', {
  amount: requestedAmount,
});

if (!walletEntitlement.allowed) {
  return NextResponse.json(
    {
      error: 'Wallet Payment Restricted',
      message: walletEntitlement.reason || 'Wallet spending is currently disabled on your account.',
    },
    { status: 403 }
  );
}
```

---

## 5. The Restriction Impact Simulator

Within the Admin User 360° Console, applying a restriction triggers the **Restriction Impact Simulator**:
- **Interactive Simulation:** As the administrator selects a feature (e.g. `SHOPPING_PURCHASE`) and restriction type (`DISABLED` or `LIMIT_USAGE` with 2,000 BDT limit), the simulator renders:
  1. **Customer-Facing Banner Preview:** The exact warning banner the customer will see upon visiting the checkout page.
  2. **Affected API Endpoints:** A clear list of backend endpoints that will immediately respond with HTTP 403 (e.g. `/api/orders`, `/api/checkout/process`).
  3. **Blast Radius Analysis:** Confirmation that unrelated capabilities (e.g. `DIGITAL_DOWNLOADS`, `SUPPORT_TICKETS`) remain untouched and operational.
- This prevents unintentional lockouts and ensures administrative transparency before saving changes to the database.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
