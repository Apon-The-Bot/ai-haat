import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "@/lib/mfa/crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { stockId } = body;

    if (!stockId) {
      return NextResponse.json({ error: "Stock ID is required." }, { status: 400 });
    }

    const stock = await prisma.digitalStock.findUnique({
      where: { id: stockId },
      include: {
        product: { select: { name: true } },
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock item not found." }, { status: 404 });
    }

    let plaintext = "";
    try {
      plaintext = decryptCredential(stock.payloadEncrypted);
    } catch {
      plaintext = stock.payloadEncrypted;
    }

    // Log the sensitive admin reveal action in security audit logs
    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        event: "STEP_UP_OK",
        success: true,
        metadata: JSON.stringify({
          action: "ADMIN_STOCK_REVEAL",
          stockId,
          productName: stock.product.name,
          adminEmail: user.email,
        }),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      credentials: plaintext,
    });
  } catch (error: any) {
    console.error("[Admin Stock Reveal Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reveal stock item credentials." },
      { status: 500 }
    );
  }
}
