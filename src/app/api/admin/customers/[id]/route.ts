import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminMfa } from "@/lib/auth-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, role: true, image: true,
      walletBalanceBDT: true, coinBalance: true, createdAt: true, updatedAt: true,
      security: { select: { totpEnabled: true, totpEnabledAt: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 25, select: { id: true, orderNumber: true, totalBDT: true, paymentMethod: true, paymentStatus: true, deliveryStatus: true, refundedBDT: true, createdAt: true, items: { select: { productName: true, variationName: true, quantity: true } } } },
      transactions: { orderBy: { createdAt: "desc" }, take: 25, select: { id: true, amountBDT: true, type: true, method: true, status: true, note: true, createdAt: true } },
      refunds: { orderBy: { createdAt: "desc" }, take: 25, select: { id: true, orderId: true, status: true, requestedAmountBDT: true, approvedAmountBDT: true, reason: true, createdAt: true, processedAt: true } },
      replacements: { orderBy: { createdAt: "desc" }, take: 25, select: { id: true, orderId: true, status: true, reason: true, createdAt: true, reviewedAt: true } },
      supportTickets: { orderBy: { lastActivityAt: "desc" }, take: 25, select: { id: true, ticketNumber: true, subject: true, category: true, priority: true, status: true, orderId: true, lastActivityAt: true, createdAt: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const reviews = await prisma.review.findMany({
    where: { OR: [{ author: user.name || "__no_name__" }, { author: user.email }] },
    orderBy: { createdAt: "desc" }, take: 25,
    select: { id: true, productId: true, rating: true, comment: true, status: true, isVerifiedPurchase: true, createdAt: true, product: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, customer: { ...user, reviews, reviewIdentity: "Matched by review author name or email because reviews have no userId." } });
}
