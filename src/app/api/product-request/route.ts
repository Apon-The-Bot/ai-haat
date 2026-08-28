import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { sendProductRequestTelegramAlert } from "@/utils/telegram";
import {
  getAllProductRequests,
  saveProductRequest,
} from "@/lib/product-requests-db";
import { ProductRequestItem } from "@/types";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

// Helper to safely unpack details JSON or string
function parseRequestDetails(rawDetails: string | null | undefined): Partial<ProductRequestItem> {
  if (!rawDetails) return {};
  try {
    if (rawDetails.trim().startsWith("{") && rawDetails.trim().endsWith("}")) {
      const parsed = JSON.parse(rawDetails);
      return {
        category: parsed.category,
        budgetBDT: parsed.budgetBDT,
        duration: parsed.duration,
        urgency: parsed.urgency,
        notes: parsed.notes,
        customerName: parsed.customerName,
        customerEmail: parsed.customerEmail,
        customerPhone: parsed.customerPhone,
        userId: parsed.userId,
      };
    }
  } catch {
    // If not JSON, treat as notes
  }
  return { notes: rawDetails };
}

// ==========================================
// GET: List requests for authenticated user / admin
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { user } = auth;
    const isAdmin = user.role === "ADMIN";
    const userEmail = (user.email || "").toLowerCase().trim();
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const searchFilter = searchParams.get("search")?.toLowerCase().trim();

    let items: ProductRequestItem[] = [];

    // 1. Try fetching from Prisma DB
    try {
      const dbRecords = await prisma.productRequest.findMany({
        orderBy: { createdAt: "desc" },
      });

      if (Array.isArray(dbRecords)) {
        items = dbRecords.map((rec) => {
          const parsed = parseRequestDetails(rec.details);
          return {
            id: rec.id,
            productName: rec.productName,
            targetBudget: rec.targetBudget,
            budgetBDT: parsed.budgetBDT || rec.targetBudget,
            contact: rec.contact,
            details: rec.details,
            status: rec.status as ProductRequestItem["status"],
            category: parsed.category || "AI Tools",
            duration: parsed.duration || "1 Month",
            urgency: parsed.urgency || "NORMAL",
            notes: parsed.notes || (rec.details?.startsWith("{") ? undefined : rec.details) || undefined,
            customerName: parsed.customerName || undefined,
            customerEmail: parsed.customerEmail || undefined,
            customerPhone: parsed.customerPhone || undefined,
            userId: parsed.userId || undefined,
            createdAt: rec.createdAt.toISOString(),
            updatedAt: rec.updatedAt.toISOString(),
          };
        });
      }
    } catch (dbErr) {
      console.warn("[Prisma GET Product Requests Warning]:", dbErr);
    }

    // 2. If Prisma returned empty or failed, check file fallback
    if (items.length === 0) {
      items = getAllProductRequests();
    }

    // 3. Apply Authorization Filter
    let filtered = items;
    if (!isAdmin) {
      filtered = filtered.filter((r) => {
        const matchesUser = r.userId && r.userId === userId;
        const matchesEmail = r.customerEmail && r.customerEmail.toLowerCase().trim() === userEmail;
        const matchesContact = r.contact && r.contact.toLowerCase().includes(userEmail);
        return matchesUser || matchesEmail || matchesContact;
      });
    }

    // 4. Apply Optional Search & Status filters
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((r) => r.status.toUpperCase() === statusFilter.toUpperCase());
    }

    if (searchFilter) {
      filtered = filtered.filter(
        (r) =>
          r.productName.toLowerCase().includes(searchFilter) ||
          (r.category && r.category.toLowerCase().includes(searchFilter)) ||
          (r.customerName && r.customerName.toLowerCase().includes(searchFilter)) ||
          (r.customerEmail && r.customerEmail.toLowerCase().includes(searchFilter)) ||
          (r.contact && r.contact.toLowerCase().includes(searchFilter))
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      requests: filtered,
    });
  } catch (error: any) {
    console.error("[Product Request GET Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve product requests" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: Submit custom product request & pre-order
// ==========================================
export async function POST(req: NextRequest) {
  // CSRF Defense
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Cross-site request forgery blocked" }, { status: 403 });
  }

  // Rate Limiting (5 product requests per 10 minutes per IP)
  const clientIp = getClientIp(req);
  const limiter = checkRateLimit(`prod_req:${clientIp}`, 5, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return rateLimitResponse(limiter.retryAfterMs, "Too many product requests. Please wait a few minutes.");
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      productName,
      category,
      budgetBDT,
      targetBudget,
      duration,
      urgency,
      notes,
      details,
      customerName,
      customerEmail,
      customerPhone,
      contact,
    } = body;

    // Validate product name
    const cleanProductName = (productName || "").trim();
    if (!cleanProductName) {
      return NextResponse.json(
        { error: "প্রোডাক্ট বা টুলের নাম দেওয়া আবশ্যক (Product name is required)." },
        { status: 400 }
      );
    }

    // Check optional authenticated user session
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;
    const finalEmail = (customerEmail || session?.user?.email || "").trim();
    const finalName = (customerName || session?.user?.name || "").trim();
    const finalPhone = (customerPhone || "").trim();

    // Check contact info
    const finalContact =
      finalPhone && finalEmail
        ? `${finalPhone} (${finalEmail})`
        : finalPhone || finalEmail || (contact || "").trim();

    if (!finalContact) {
      return NextResponse.json(
        { error: "যোগাযোগের জন্য হোয়াটসঅ্যাপ নাম্বার বা ইমেইল প্রদান করুন (WhatsApp or Email is required)." },
        { status: 400 }
      );
    }

    const cleanCategory = (category || "AI Tools").trim();
    const cleanDuration = (duration || "1 Month").trim();
    const cleanUrgency = (urgency || "NORMAL").trim();
    const cleanNotes = (notes || details || "").trim();
    const cleanBudget = budgetBDT ? String(budgetBDT).trim() : (targetBudget ? String(targetBudget).trim() : "");
    const budgetDisplay = cleanBudget ? `৳${cleanBudget.replace(/^৳/, "")}` : null;

    // Pack extended metadata into details JSON for Prisma db
    const metadataPayload = {
      category: cleanCategory,
      budgetBDT: cleanBudget || null,
      duration: cleanDuration,
      urgency: cleanUrgency,
      notes: cleanNotes || null,
      customerName: finalName || null,
      customerEmail: finalEmail || null,
      customerPhone: finalPhone || null,
      userId: userId || null,
    };
    const structuredDetails = JSON.stringify(metadataPayload);

    let createdId = `PR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    let createdAtIso = new Date().toISOString();

    // 1. Save to Prisma Database
    try {
      const dbSaved = await prisma.productRequest.create({
        data: {
          productName: cleanProductName,
          targetBudget: budgetDisplay,
          contact: finalContact,
          details: structuredDetails,
          status: "PENDING",
        },
      });
      if (dbSaved?.id) {
        createdId = dbSaved.id;
        createdAtIso = dbSaved.createdAt.toISOString();
      }
    } catch (dbErr) {
      console.warn("[Prisma Product Request DB Warning]:", dbErr);
    }

    // 2. Save to Resilient File-Based Store
    const fallbackItem: ProductRequestItem = {
      id: createdId,
      productName: cleanProductName,
      category: cleanCategory,
      budgetBDT: cleanBudget || null,
      targetBudget: budgetDisplay,
      duration: cleanDuration,
      urgency: cleanUrgency,
      notes: cleanNotes || null,
      customerName: finalName || null,
      customerEmail: finalEmail || null,
      customerPhone: finalPhone || null,
      contact: finalContact,
      details: structuredDetails,
      status: "PENDING",
      userId: userId || null,
      createdAt: createdAtIso,
      updatedAt: createdAtIso,
    };
    saveProductRequest(fallbackItem);

    // 3. Dispatch Real-Time Telegram Alert to Admin
    try {
      await sendProductRequestTelegramAlert({
        requestId: createdId,
        productName: cleanProductName,
        category: cleanCategory,
        budgetBDT: cleanBudget || undefined,
        targetBudget: budgetDisplay || undefined,
        duration: cleanDuration,
        urgency: cleanUrgency,
        notes: cleanNotes || undefined,
        customerName: finalName || undefined,
        customerEmail: finalEmail || undefined,
        customerPhone: finalPhone || undefined,
        contact: finalContact,
      });
    } catch (teleErr) {
      console.warn("[Telegram Product Request Alert Warning]:", teleErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "আপনার প্রোডাক্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।",
        request: fallbackItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Product Request POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "রিকোয়েস্ট প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
