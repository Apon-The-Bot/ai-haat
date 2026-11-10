# 04 — BACKEND API FIXES & ROUTE AUDIT REPORT

This report details the architectural repairs, method additions, rate limiting policies, and error handling hardening implemented across AI Haat's Next.js API route handlers.

---

## 1. Overview of Modified API Handlers

| Route Handler | Methods Supported | Security / Reliability Fix Implemented |
| :--- | :---: | :--- |
| `src/app/api/orders/[id]/invoice/route.ts` | `GET` | Added strict HMAC token and email ownership verification; added rate limiting (20 req/min). |
| `src/app/api/orders/route.ts` | `GET`, `POST` | Redacted `giftClaimToken` from unauthenticated public tracking responses. |
| `src/app/api/admin/products/route.ts` | `GET`, `POST` | Added missing `POST` handler wrapping `createProduct()` with `requireAdminMfa()`. |
| `src/app/api/admin/products/[id]/route.ts` | `GET`, `PATCH`, `PUT`, `DELETE` | Added `PUT` handler aliasing `PATCH` for seamless REST updates from admin form. |
| `src/app/api/admin/email-marketing/settings/route.ts` | `GET`, `POST` | Implemented AES-256-GCM encryption on `smtpPass` and `apiKey` before database persistence. |
| `src/app/api/upload/route.ts` | `POST` | Removed `.svg` support, added magic-byte raster validation, 10MB size limit, unguessable filenames. |
| `src/app/api/affiliate/click/route.ts` | `POST` | Added referral code format regex and IP-based rate limiting & deduplication. |
| `src/middleware.ts` | Global Edge | Intercepts all administrative mutations and validates Same-Origin CSRF tokens. |

---

## 2. Technical Implementation Details

### 2.1 Admin Products Creation & Update Endpoints (`/api/admin/products`)
- **Missing `POST` Method Restored:**
  ```typescript
  export async function POST(req: NextRequest) {
    try {
      const authResult = await requireAdminMfa();
      if (authResult instanceof NextResponse) return authResult;

      const body = await req.json();
      if (!body.name || !body.category) {
        return NextResponse.json(
          { success: false, error: "Product name and category are required." },
          { status: 400 }
        );
      }

      const product = await createProduct(body, authResult.user);
      return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }
  ```
- **`PUT` Method Aliasing Added:**
  ```typescript
  export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    return PATCH(req, context);
  }
  ```

### 2.2 Guest Invoice Download Route (`/api/orders/[id]/invoice`)
- **Separation of Concerns:**
  Created `src/lib/invoicing/tokens.ts` containing the cryptographic HMAC token generator and constant-time validator:
  ```typescript
  export function generateInvoiceToken(orderId: string, email: string): string {
    const secret = process.env.NEXTAUTH_SECRET || "ai-haat-invoice-signature-secret";
    return crypto.createHmac("sha256", secret).update(`${orderId}:${email.toLowerCase().trim()}`).digest("hex");
  }
  ```
- **Execution Flow in Handler:**
  1. Rate limit check: max 20 calls/min per client IP.
  2. Order lookup: retrieves order by ID or orderNumber.
  3. Session check: if caller is Admin or order owner, permit download.
  4. Guest validation: if order has no `userId`, evaluate `tokenParam` (constant-time comparison against HMAC) or `emailParam` (case-insensitive string match). If mismatched or absent, reject with HTTP 403.
  5. Cache control: Set `private, no-cache, no-store, must-revalidate` to prevent intermediary proxy caching of PII.

### 2.3 Email Marketing Settings Route (`/api/admin/email-marketing/settings`)
- **Ciphertext Encryption:**
  Sensitive credentials (`smtpPass`, `apiKey`) are passed through `encryptCredential()` before writing to `prisma.siteSetting.upsert`.
  When loaded in `src/lib/email-marketing/provider.ts`, `decryptCredential()` restores plaintext in-memory for the Nodemailer transporter while leaving database records securely encrypted at rest.

### 2.4 Affiliate Click Tracking Route (`/api/affiliate/click`)
- **Anti-Inflation Filter:**
  Validates incoming referral codes against `^[A-Z0-9_-]{3,50}$`.
  Rate limits incoming clicks to 10 per minute per IP per code:
  ```typescript
  const clientIp = getClientIp(req);
  const rl = checkRateLimit(`ref_click:${clientIp}:${cleanCode}`, 10, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ success: true, deduplicated: true });
  }
  ```

---

## 3. Rate Limiting Architecture Verification

The rate limiting engine in `src/lib/rate-limit.ts` was verified across:
- **Cloudflare Edge Deployment:** Accurately extracts `cf-connecting-ip`.
- **Nginx Reverse Proxy Deployment:** Accurately extracts `x-real-ip` and first client IP of `x-forwarded-for`.
- **Sliding-Window Memory Store:** Prunes stale entries every 60 seconds with an upper bound of 10,000 keys to prevent Memory-Exhaustion DoS.
