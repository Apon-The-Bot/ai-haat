import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isUserAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderInvoicePDF } from "@/lib/invoicing/pdf-generator";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { generateInvoiceToken, safeTokenCompare } from "@/lib/invoicing/tokens";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Rate limit invoice requests to prevent enumeration attacks (max 20 / minute per IP)
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`invoice:${clientIp}`, 20, 60 * 1000);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs, "Too many invoice download attempts. Please wait a minute.");
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Strict Authorization Verification
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string; email?: string; role?: string } | undefined;
    const isAdmin = sessionUser?.role === "ADMIN" || isUserAdmin(sessionUser?.email);

    // If caller is an authenticated Admin, permit access
    if (isAdmin) {
      // Authorized admin access
    } else if (order.userId) {
      // Authenticated User Order: Caller MUST be signed in as the order owner
      if (!sessionUser || !sessionUser.id) {
        return NextResponse.json(
          { error: "Authentication required to access this invoice." },
          { status: 401 }
        );
      }

      const isOwner = sessionUser.id === order.userId || 
        (sessionUser.email && sessionUser.email.toLowerCase().trim() === order.customerEmail.toLowerCase().trim());

      if (!isOwner) {
        return NextResponse.json(
          { error: "Unauthorized access: You do not own this order." },
          { status: 403 }
        );
      }
    } else {
      // Guest Order: Require either a signed HMAC token OR matching customer email
      const emailParam = req.nextUrl.searchParams.get("email");
      const tokenParam = req.nextUrl.searchParams.get("token");

      let isGuestAuthorized = false;

      // Check token match
      if (tokenParam) {
        const expectedToken = generateInvoiceToken(order.id, order.customerEmail);
        const expectedTokenByNumber = generateInvoiceToken(order.orderNumber, order.customerEmail);
        if (
          safeTokenCompare(tokenParam, expectedToken) ||
          safeTokenCompare(tokenParam, expectedTokenByNumber)
        ) {
          isGuestAuthorized = true;
        }
      }

      // Check email match
      if (!isGuestAuthorized && emailParam) {
        const cleanParam = emailParam.toLowerCase().trim();
        const cleanOrderEmail = order.customerEmail.toLowerCase().trim();
        if (cleanParam === cleanOrderEmail) {
          isGuestAuthorized = true;
        }
      }

      // If session user email matches guest order email, authorize
      if (!isGuestAuthorized && sessionUser?.email) {
        if (sessionUser.email.toLowerCase().trim() === order.customerEmail.toLowerCase().trim()) {
          isGuestAuthorized = true;
        }
      }

      if (!isGuestAuthorized) {
        return NextResponse.json(
          {
            error: "Unauthorized access to guest invoice. Please provide the customer email (?email=) or a valid access token (?token=).",
            code: "GUEST_VERIFICATION_REQUIRED"
          },
          { status: 403 }
        );
      }
    }

    const pdfBuffer = await generateOrderInvoicePDF({
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trxId: order.trxId || undefined,
      items: order.items.map((it) => ({
        name: it.productName,
        variation: it.variationName,
        quantity: it.quantity,
        unitPriceBDT: it.priceBDT,
        totalBDT: it.priceBDT * it.quantity,
      })),
      subtotalBDT: order.subtotalBDT,
      discountBDT: order.discountBDT,
      totalBDT: order.totalBDT,
    });

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Invoice generation error:", err);
    return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 });
  }
}
