import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { createGiftCard } from "@/lib/gifting/gift-cards";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { checkFeatureEntitlement } from "@/lib/user-control/user-control-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (!isSameOriginMutation(req)) return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
    const { user } = auth;
    const entitlement = await checkFeatureEntitlement(user.id, "SHOPPING_PURCHASE", { action: "PURCHASE" });
    if (!entitlement.allowed) return NextResponse.json({ error: entitlement.reason }, { status: 403 });

    const body = await req.json();
    const { amountBDT, recipientEmail, recipientName, customMessage, senderName } = body;

    const amount = Number(amountBDT);
    if (!Number.isFinite(amount) || amount < 50) {
      return NextResponse.json({ error: "সর্বনিম্ন গিফট কার্ড মূল্য ৫০ ৳।" }, { status: 400 });
    }

    const card = await createGiftCard({
      amountBDT: amount,
      purchasedByUserId: user.id,
      recipientEmail,
      recipientName,
      senderName: senderName || user.name,
      senderEmail: user.email,
      customMessage,
    });

    if (!card) return NextResponse.json({ error: "ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।" }, { status: 409 });
    return NextResponse.json({ success: true, giftCard: card });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const cards = await prisma.giftCard.findMany({
      where: {
        OR: [
          { purchasedByUserId: auth.user.id },
          { redeemedByUserId: auth.user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, giftCards: cards });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
