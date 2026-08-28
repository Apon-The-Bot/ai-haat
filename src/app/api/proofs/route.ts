import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PROOFS as seedProofs } from "@/data/proofs";
import { ProofItem } from "@/types";

export const dynamic = "force-dynamic";

function inferCategory(productName: string, type?: string, existingCategory?: string): string {
  if (existingCategory && existingCategory !== "All") return existingCategory;
  const name = (productName || "").toLowerCase();
  const t = (type || "").toLowerCase();

  if (
    name.includes("chatgpt") ||
    name.includes("claude") ||
    name.includes("gemini") ||
    name.includes("midjourney") ||
    name.includes("cursor") ||
    name.includes("perplexity") ||
    name.includes("openai") ||
    name.includes("ai")
  ) {
    return "AI Tools";
  }

  if (
    name.includes("windows") ||
    name.includes("office") ||
    name.includes("microsoft") ||
    name.includes("idm") ||
    t.includes("license")
  ) {
    return "Windows & Office";
  }

  if (
    name.includes("vpn") ||
    name.includes("nord") ||
    name.includes("express") ||
    name.includes("surfshark")
  ) {
    return "VPNs";
  }

  if (
    name.includes("canva") ||
    name.includes("netflix") ||
    name.includes("youtube") ||
    name.includes("spotify") ||
    name.includes("capcut") ||
    name.includes("telegram") ||
    t.includes("subscription")
  ) {
    return "Subscriptions";
  }

  return "Subscriptions";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || searchParams.get("type") || "All";
    const search = (searchParams.get("search") || searchParams.get("q") || "").toLowerCase().trim();
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    let proofs: ProofItem[] = [];

    try {
      const dbProofs = await prisma.proof.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (dbProofs && dbProofs.length > 0) {
        proofs = dbProofs.map((p) => {
          const cat = inferCategory(p.productName, p.type);
          return {
            id: p.id,
            orderId: p.orderId,
            productName: p.productName,
            amountBDT: p.amountBDT,
            type: p.type,
            category: cat,
            image: p.image,
            customerNote: p.customerNote,
            date: p.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            createdAt: p.createdAt.toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn("[Prisma Proofs GET fallback to seed]:", err);
    }

    // Combine or fallback to seed proofs
    if (proofs.length === 0) {
      proofs = seedProofs.map((p) => ({
        ...p,
        category: p.category || inferCategory(p.productName, p.type),
      }));
    } else {
      // Ensure seed proofs are included if DB has only a few records
      const existingIds = new Set(proofs.map((p) => p.orderId));
      for (const sp of seedProofs) {
        if (!existingIds.has(sp.orderId)) {
          proofs.push({
            ...sp,
            category: sp.category || inferCategory(sp.productName, sp.type),
          });
        }
      }
    }

    // 1. Filter by Category
    if (category && category !== "All") {
      proofs = proofs.filter((p) => {
        const itemCat = p.category || inferCategory(p.productName, p.type);
        if (category === "AI Tools") {
          return itemCat === "AI Tools" || inferCategory(p.productName, p.type) === "AI Tools";
        }
        if (category === "Subscriptions") {
          return itemCat === "Subscriptions" || inferCategory(p.productName, p.type) === "Subscriptions";
        }
        if (category === "Windows & Office") {
          return itemCat === "Windows & Office" || inferCategory(p.productName, p.type) === "Windows & Office";
        }
        if (category === "VPNs") {
          return itemCat === "VPNs" || inferCategory(p.productName, p.type) === "VPNs";
        }
        return itemCat.toLowerCase() === category.toLowerCase() || p.type?.toLowerCase() === category.toLowerCase();
      });
    }

    // 2. Filter by Search Query
    if (search) {
      proofs = proofs.filter((p) => {
        return (
          p.orderId.toLowerCase().includes(search) ||
          p.productName.toLowerCase().includes(search) ||
          p.customerNote.toLowerCase().includes(search) ||
          p.type.toLowerCase().includes(search) ||
          (p.category && p.category.toLowerCase().includes(search))
        );
      });
    }

    if (limit && limit > 0) {
      proofs = proofs.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      proofs,
      total: proofs.length,
      categories: ["All", "AI Tools", "Subscriptions", "Windows & Office", "VPNs"],
    });
  } catch (error: any) {
    console.error("[Proofs API GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proofs", proofs: seedProofs },
      { status: 500 }
    );
  }
}
