import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const proofs = await prisma.proof.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = proofs.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      productName: p.productName,
      amountBDT: p.amountBDT,
      type: p.type,
      image: p.image,
      customerNote: p.customerNote,
      date: p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, proofs: formatted });
  } catch (error: any) {
    console.error("[Admin Proofs GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch proofs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { orderId, productName, amountBDT, customerNote, image, type } = body;

    if (!productName || !amountBDT) {
      return NextResponse.json({ error: "Product name and amount are required." }, { status: 400 });
    }

    const newProof = await prisma.proof.create({
      data: {
        orderId: orderId || `AH-${Math.floor(10000 + Math.random() * 90000)}`,
        productName: productName.trim(),
        amountBDT: Number(amountBDT) || 290,
        type: type || "Subscription",
        image: image || "https://images.unsplash.com/photo-1556742049-0a67e557224f?w=400",
        customerNote: customerNote ? customerNote.trim() : "Instant delivery verified.",
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROOF_CREATE",
      targetType: "PROOF",
      targetId: newProof.id,
      details: { productName: newProof.productName, amountBDT: newProof.amountBDT },
    });

    return NextResponse.json({ success: true, proof: newProof });
  } catch (error: any) {
    console.error("[Admin Proofs POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to create delivery proof" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Proof ID is required" }, { status: 400 });
    }

    await prisma.proof.delete({ where: { id } });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "PROOF_DELETE",
      targetType: "PROOF",
      targetId: id,
    });

    return NextResponse.json({ success: true, message: "Proof deleted successfully." });
  } catch (error: any) {
    console.error("[Admin Proofs DELETE Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete proof" }, { status: 500 });
  }
}
