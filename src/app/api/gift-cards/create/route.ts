import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { createGiftCard } from "@/lib/gifting/gift-cards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const userId = !(auth instanceof NextResponse) ? auth.user.id : undefined;
    const userEmail = !(auth instanceof NextResponse) ? auth.user.email : undefined;
    const userName = !(auth instanceof NextResponse) ? auth.user.name : undefined;

    const body = await req.json();
    const { amountBDT, recipientEmail, recipientName, customMessage, senderName } = body;

    const amount = Number(amountBDT);
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "সর্বনিম্ন গিফট কার্ড মূল্য ৫০ ৳।" }, { status: 400 });
    }

    const card = await createGiftCard({
      amountBDT: amount,
      purchasedByUserId: userId,
      recipientEmail,
      recipientName,
      senderName: senderName || userName || undefined,
      senderEmail: userEmail || undefined,
      customMessage,
    });

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
