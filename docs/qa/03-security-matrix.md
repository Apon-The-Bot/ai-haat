# 03 — Security, Authentication & IDOR Test Matrix

## 1. Authentication & Role Boundary Matrix

| Actor / Session | Target Resource / Endpoint | Expected Response | Security Invariant |
| :--- | :--- | :--- | :--- |
| **Anonymous** | `GET /api/vault/credentials` | `401 Unauthorized` | Private credentials require authenticated session. |
| **Anonymous** | `POST /api/wallet/purchase` | `401 Unauthorized` | Financial mutations require authenticated user. |
| **Anonymous** | `GET /api/admin/orders` | `401 Unauthorized` | Admin endpoints blocked from public access. |
| **USER Role** | `GET /api/admin/orders` | `403 Forbidden` | Standard customer cannot list global orders. |
| **USER Role** | `POST /api/admin/deliver` | `403 Forbidden` | Standard customer cannot trigger manual fulfillment. |
| **USER Role** | `POST /api/admin/refunds` | `403 Forbidden` | Standard customer cannot execute admin refunds. |
| **ADMIN without MFA** | `POST /api/admin/deliver` | `403 MFA Required` | Critical admin operations enforce step-up MFA. |
| **ADMIN with MFA** | `POST /api/admin/deliver` | `200 OK` | Authorized operation succeeds. |

---

## 2. 11-Resource IDOR Matrix (User A accessing User B)

| Resource | Target Entity | IDOR Test Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **1. Orders** | `Order` | User A queries User B's `orderId` | `403/404` (Access Denied) |
| **2. OrderItems** | `OrderItem` | User A requests details of User B's line item | `403/404` (Access Denied) |
| **3. Delivered Keys** | `DeliveredKey` | User A queries User B's key via `/api/vault/credentials` | `403/404` (Key Not Returned) |
| **4. Wallet** | `WalletTransaction` | User A queries User B's transaction history | `403/404` (Access Denied) |
| **5. Wallet Debit** | `User.walletBalance` | User A attempts purchase specifying User B's balance | `403` (Session User Enforced) |
| **6. Notifications** | `Notification` | User A queries User B's in-app alerts | `Empty / 403` (Isolated by `userId`) |
| **7. Refunds** | `RefundRequest` | User A requests refund for User B's order | `403` (Ownership Violation) |
| **8. Replacements** | `ReplacementRequest` | User A claims replacement on User B's delivered key | `403` (Ownership Violation) |
| **9. Support Tickets** | `SupportTicket` | User A views or messages on User B's ticket | `403/404` (Access Denied) |
| **10. Downloads** | `Download` | User A requests signed download link for User B's item | `403` (Access Denied) |
| **11. User Security** | `TOTP / MFA` | User A requests disable/reset for User B's MFA | `403` (Session User Enforced) |
