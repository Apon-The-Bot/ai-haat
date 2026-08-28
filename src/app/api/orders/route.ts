import { requireAuth, requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllOrders, saveOrder, updateOrderStatus, findOrderByNumberOrPhone } from "@/lib/orders-db";
import { sendNewOrderTelegramAlert } from "@/utils/telegram";
import { calculateOrderQuote } from "@/lib/commerce/pricing";
import { logAdminAudit } from "@/lib/audit-logger";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("search");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const isPublicTracking = searchParams.get("tracking") === "true";
    const singleOrderId = searchParams.get("orderId");
    const deliveryStatusFilter = searchParams.get("deliveryStatus");
    const paymentStatusFilter = searchParams.get("paymentStatus");
    const paymentMethodFilter = searchParams.get("paymentMethod");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)));

    // 1. Safe Public Order Tracking Pathway (Lookup by Order ID or Customer Phone, stripped of PII and credentials)
    if (isPublicTracking && query) {
      const cleanQuery = query.trim();
      const digitsOnly = cleanQuery.replace(/\D/g, "");

      try {
        const orConditions: any[] = [
          { orderNumber: cleanQuery },
          { id: cleanQuery },
          { customerPhone: cleanQuery },
        ];

        if (digitsOnly.length >= 8) {
          orConditions.push({ customerPhone: { contains: digitsOnly } });
          if (digitsOnly.startsWith("88") && digitsOnly.length > 10) {
            orConditions.push({ customerPhone: { contains: digitsOnly.substring(2) } });
          }
        }

        const trackedOrders = await prisma.order.findMany({
          where: {
            OR: orConditions,
          },
          include: {
            items: true,
            timelineEvents: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                status: true,
                actor: true,
                note: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        if (trackedOrders && trackedOrders.length > 0) {
          const safeOrders = trackedOrders.map((tracked) => {
            const rawDelivery = tracked.deliveryStatus;
            const rawPayment = tracked.paymentStatus;

            // Safe masking helpers
            const maskPhone = (p: string) => {
              if (!p) return "";
              const clean = p.trim();
              if (clean.length <= 6) return "***";
              return clean.slice(0, 3) + "****" + clean.slice(-4);
            };

            const maskName = (n: string) => {
              if (!n) return "Customer";
              const parts = n.trim().split(" ");
              return parts
                .map((pt) => (pt.length > 1 ? pt[0] + "*".repeat(Math.min(pt.length - 1, 4)) : pt))
                .join(" ");
            };

            const maskEmail = (e: string) => {
              if (!e || !e.includes("@")) return "";
              const [userPart, domain] = e.split("@");
              const maskedUser = userPart.length > 2 ? userPart.slice(0, 2) + "***" : userPart[0] + "***";
              return `${maskedUser}@${domain}`;
            };

            return {
              id: tracked.orderNumber || tracked.id,
              orderNumber: tracked.orderNumber || tracked.id,
              customerName: maskName(tracked.customerName),
              customerPhone: maskPhone(tracked.customerPhone),
              customerEmail: maskEmail(tracked.customerEmail),
              items: tracked.items.map((it) => ({
                id: it.id,
                productId: it.productId,
                productName: it.productName,
                variationName: it.variationName,
                quantity: it.quantity,
                priceBDT: it.priceBDT,
                image: it.image || null,
                deliveryStatus: it.deliveryStatus,
                fulfillmentType: it.fulfillmentType,
              })),
              totalBDT: tracked.totalBDT,
              subtotalBDT: tracked.subtotalBDT,
              discountBDT: tracked.discountBDT,
              paymentMethod: tracked.paymentMethod,
              trxId: tracked.trxId ? tracked.trxId.slice(0, 4) + "****" : undefined,
              paymentStatus:
                rawPayment === "VERIFIED" ? "Completed" : rawPayment === "FAILED" ? "Failed" : "Pending",
              rawPaymentStatus: rawPayment,
              deliveryStatus:
                rawDelivery === "DELIVERED"
                  ? "Delivered"
                  : rawDelivery === "CANCELLED"
                  ? "Cancelled"
                  : rawDelivery === "PROCESSING"
                  ? "Processing"
                  : rawDelivery === "PREPARING"
                  ? "Preparing"
                  : "Order Placed",
              rawDeliveryStatus: rawDelivery,
              timelineEvents: tracked.timelineEvents || [],
              date: tracked.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              createdAt: tracked.createdAt.toISOString(),
              updatedAt: tracked.updatedAt.toISOString(),
            };
          });

          return NextResponse.json({
            success: true,
            orders: safeOrders,
          });
        }
      } catch (err) {
        console.warn("[Prisma Public Tracking Warning]:", err);
      }

      // Fallback tracking via JSON DB
      const localMatches = findOrderByNumberOrPhone(cleanQuery);
      if (localMatches.length > 0) {
        const stripped = localMatches.map((o) => ({
          id: o.orderNumber || o.id,
          orderNumber: o.orderNumber || o.id,
          customerName: o.customerName ? o.customerName[0] + "***" : "Customer",
          customerPhone: o.customerPhone ? o.customerPhone.slice(0, 3) + "****" + o.customerPhone.slice(-4) : "",
          customerEmail: o.customerEmail ? o.customerEmail.slice(0, 2) + "***" : "",
          items: (o.items || []).map((it: any) => ({
            id: it.id || it.productId,
            productId: it.productId,
            productName: it.productName || it.name,
            variationName: it.variationName,
            quantity: it.quantity,
            priceBDT: it.priceBDT || 0,
            image: it.image || null,
          })),
          totalBDT: o.totalBDT,
          subtotalBDT: o.subtotalBDT || o.totalBDT,
          discountBDT: o.discountBDT || 0,
          paymentMethod: o.paymentMethod,
          trxId: o.trxId ? o.trxId.slice(0, 4) + "****" : undefined,
          paymentStatus: o.paymentStatus,
          rawPaymentStatus: o.paymentStatus === "Completed" ? "VERIFIED" : o.paymentStatus === "Failed" ? "FAILED" : "PENDING",
          deliveryStatus: o.deliveryStatus,
          rawDeliveryStatus:
            o.deliveryStatus === "Delivered"
              ? "DELIVERED"
              : o.deliveryStatus === "Cancelled"
              ? "CANCELLED"
              : o.deliveryStatus === "Preparing"
              ? "PREPARING"
              : o.deliveryStatus === "Processing"
              ? "PROCESSING"
              : "ORDER_PLACED",
          timelineEvents: [],
          date: o.date || "Recently",
          createdAt: o.createdAt || new Date().toISOString(),
          updatedAt: o.updatedAt || new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, orders: stripped });
      }

      return NextResponse.json({ success: true, orders: [] });
    }

    // 2. Authenticated Order Fetching (All listings require session)
    const auth = await requireAuth();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { user } = auth;
    const isAdmin = user.role === "ADMIN";

    // 3. Single Detailed Order Retrieval
    if (singleOrderId) {
      const cleanId = singleOrderId.trim();
      const whereSingle: any = {
        OR: [{ id: cleanId }, { orderNumber: cleanId }],
      };

      if (!isAdmin) {
        whereSingle.AND = [
          {
            OR: [
              { userId: user.id },
              { customerEmail: user.email.toLowerCase().trim() },
            ],
          },
        ];
      }

      const orderDetail = await prisma.order.findFirst({
        where: whereSingle,
        include: {
          items: {
            include: {
              deliveredKeys: {
                select: {
                  id: true,
                  productName: true,
                  accountType: true,
                  warrantyExpiresAt: true,
                  isReplacement: true,
                  deliveredAt: true,
                },
              },
              digitalStocks: isAdmin
                ? {
                    select: {
                      id: true,
                      status: true,
                      type: true,
                      batchRef: true,
                      costPriceBDT: true,
                    },
                  }
                : false,
            },
          },
          deliveredKeys: {
            select: {
              id: true,
              orderItemId: true,
              productName: true,
              accountType: true,
              instructions: true,
              warrantyExpiresAt: true,
              isReplacement: true,
              deliveredAt: true,
            },
          },
          timelineEvents: {
            orderBy: { createdAt: "desc" },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              walletBalanceBDT: true,
              createdAt: true,
            },
          },
        },
      });

      if (!orderDetail) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, order: orderDetail });
    }

    // 4. Query Prisma MySQL Database with Multi-filtering & Server Pagination
    try {
      const whereClause: any = {};

      if (!isAdmin) {
        // Non-admin can ONLY view their own orders
        whereClause.OR = [
          { userId: user.id },
          { customerEmail: user.email.toLowerCase().trim() },
        ];
      } else {
        // Admin filters
        if (deliveryStatusFilter && deliveryStatusFilter !== "ALL") {
          whereClause.deliveryStatus = deliveryStatusFilter;
        }

        if (paymentStatusFilter && paymentStatusFilter !== "ALL") {
          whereClause.paymentStatus = paymentStatusFilter;
        }

        if (paymentMethodFilter && paymentMethodFilter !== "ALL") {
          whereClause.paymentMethod = paymentMethodFilter;
        }

        if (email) {
          const cleanEmail = email.trim().toLowerCase();
          whereClause.OR = [
            { customerEmail: { equals: cleanEmail } },
            { user: { email: { equals: cleanEmail } } },
          ];
        }

        if (phone) {
          whereClause.customerPhone = { contains: phone.trim() };
        }

        if (startDate || endDate) {
          whereClause.createdAt = {};
          if (startDate) whereClause.createdAt.gte = new Date(startDate);
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.createdAt.lte = end;
          }
        }

        if (query) {
          const clean = query.trim();
          whereClause.OR = [
            { orderNumber: { contains: clean } },
            { id: { contains: clean } },
            { customerName: { contains: clean } },
            { customerEmail: { contains: clean } },
            { customerPhone: { contains: clean } },
            { trxId: { contains: clean } },
          ];
        }
      }

      const total = await prisma.order.count({ where: whereClause });
      const totalPages = Math.ceil(total / pageSize);
      const skip = (page - 1) * pageSize;

      const dbOrders = await prisma.order.findMany({
        where: whereClause,
        include: {
          items: true,
          deliveredKeys: {
            select: {
              id: true,
              productName: true,
              accountType: true,
              deliveredAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      });

      const formatted = dbOrders.map((o) => ({
        id: o.orderNumber || o.id,
        orderNumber: o.orderNumber || o.id,
        userId: o.userId,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.productName,
          variationName: it.variationName,
          quantity: it.quantity,
          priceBDT: it.priceBDT,
          image: it.image,
          deliveryStatus: it.deliveryStatus,
          fulfillmentType: it.fulfillmentType,
        })),
        totalBDT: o.totalBDT,
        subtotalBDT: o.subtotalBDT,
        discountBDT: o.discountBDT,
        paymentMethod: o.paymentMethod,
        senderNumber: o.senderNumber,
        trxId: o.trxId,
        paymentStatus: o.paymentStatus === "VERIFIED" ? "Completed" : o.paymentStatus === "FAILED" ? "Failed" : "Pending",
        deliveryStatus:
          o.deliveryStatus === "DELIVERED"
            ? "Delivered"
            : o.deliveryStatus === "CANCELLED"
            ? "Cancelled"
            : o.deliveryStatus === "PROCESSING"
            ? "Processing"
            : o.deliveryStatus === "PREPARING"
            ? "Preparing"
            : "Order Placed",
        rawDeliveryStatus: o.deliveryStatus,
        rawPaymentStatus: o.paymentStatus,
        notes: o.notes,
        hasDeliveredKeys: o.deliveredKeys.length > 0,
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today",
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        orders: formatted,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      });
    } catch (dbErr) {
      console.warn("[Prisma GET Orders fallback to JSON]:", dbErr);
    }

    // 5. Fallback to Local JSON DB (with strict ownership filtering)
    let localOrders = getAllOrders();
    if (!isAdmin) {
      localOrders = localOrders.filter((o) => o.customerEmail?.toLowerCase() === user.email.toLowerCase());
    } else {
      if (email) {
        localOrders = localOrders.filter((o) => o.customerEmail?.toLowerCase() === email.toLowerCase());
      }
      if (phone) {
        localOrders = localOrders.filter((o) => o.customerPhone?.includes(phone));
      }
    }

    const strippedLocal = localOrders.map((o) => ({
      ...o,
      credentialsDelivered: undefined,
    }));

    return NextResponse.json({
      success: true,
      orders: strippedLocal,
      pagination: {
        page: 1,
        pageSize: strippedLocal.length,
        total: strippedLocal.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    console.error("[Orders GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // CSRF Defense
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Cross-site request forgery blocked" }, { status: 403 });
  }

  // Rate Limiting (15 order creation attempts per 10 minutes per IP/User)
  const clientIp = getClientIp(req);
  const limiter = checkRateLimit(`order_post:${clientIp}`, 15, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return rateLimitResponse(limiter.retryAfterMs, "Too many order attempts. Please wait a few minutes.");
  }

  try {
    const body = await req.json();
    const {
      orderNumber,
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      couponCode,
      paymentMethod,
      senderNumber,
      trxId,
      notes,
      utmSource, utmMedium, utmCampaign, utmContent, utmTerm, landingPage, referrer
    } = body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
    }

    // 1. Server-Authoritative Price & Coupon Recalculation
    const priceCalculation = await calculateOrderQuote(
      items.map((it: any) => ({
        productId: it.productId || it.id || "",
        variationId: it.variationId || it.selectedVariation?.id || null,
        productName: it.productName || it.name || "",
        variationName: it.variationName || it.selectedVariation?.name || "",
        quantity: Number(it.quantity) || 1,
      })),
      couponCode
    );

    if (!priceCalculation.isValid) {
      return NextResponse.json({ error: priceCalculation.error || "Invalid items in order." }, { status: 400 });
    }

    const { quote } = priceCalculation;
    // V10 FIX: Always generate order ID server-side — never trust client-supplied IDs
    // SECURITY FIX: Use crypto-grade random bytes for order ID (4B+ possibilities vs 90K)
    const { randomBytes } = require("crypto");
    const generatedNumber = `AH-${randomBytes(4).toString("hex").toUpperCase()}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newOrder = {
      id: generatedNumber,
      orderNumber: generatedNumber,
      customerName,
      customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : "",
      customerPhone,
      items: quote.items,
      totalBDT: quote.totalBDT,
      subtotalBDT: quote.subtotalBDT,
      discountBDT: quote.discountBDT,
      couponCode: quote.couponCode,
      paymentMethod: paymentMethod || "gateway",
      senderNumber: senderNumber || "",
      trxId: trxId || "",
      paymentStatus: "Pending" as any,
      deliveryStatus: "Order Placed" as any,
      notes: notes || "",
      date: dateFormatted,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    let userRecord: any = null;
    // 2. Save Order to Prisma MySQL with atomic coupon consumption
    try {
      if (customerEmail) {
        userRecord = await prisma.user.findFirst({
          where: {
            OR: [
              { email: customerEmail.trim().toLowerCase() },
              { email: customerEmail.trim() },
            ],
          },
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.upsert({
          where: { orderNumber: generatedNumber },
          create: {
            id: generatedNumber,
            orderNumber: generatedNumber,
            userId: userRecord?.id || null,
            customerName,
            customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : "customer@aihaat.shop",
            customerPhone,
            notes: notes || null,
            subtotalBDT: quote.subtotalBDT,
            discountBDT: quote.discountBDT,
            totalBDT: quote.totalBDT,
            paymentMethod: paymentMethod || "gateway",
            senderNumber: senderNumber || null,
            trxId: trxId || null,
            paymentStatus: "PENDING",
            deliveryStatus: "ORDER_PLACED",
            // Marketing Attribution (truncated for safety)
            utmSource: typeof utmSource === 'string' ? utmSource.slice(0, 200) : undefined,
            utmMedium: typeof utmMedium === 'string' ? utmMedium.slice(0, 200) : undefined,
            utmCampaign: typeof utmCampaign === 'string' ? utmCampaign.slice(0, 200) : undefined,
            utmContent: typeof utmContent === 'string' ? utmContent.slice(0, 200) : undefined,
            utmTerm: typeof utmTerm === 'string' ? utmTerm.slice(0, 200) : undefined,
            landingPage: typeof landingPage === 'string' ? landingPage.slice(0, 500) : undefined,
            referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : undefined,
            items: {
              create: quote.items.map((p: any) => ({
                productId: p.productId,
                variationId: p.variationId || null,
                productName: p.productName,
                variationName: p.variationName,
                priceBDT: p.priceBDT,
                quantity: p.quantity,
                image: p.image || null,
                fulfillmentType: p.fulfillmentType || "AUTO_STOCK",
                warrantyDaysAtPurchase: p.warrantyDays || 30,
                refundWindowDaysAtPurchase: p.refundWindowDays || 7,
                replacementAllowedAtPurchase: p.replacementAllowed ?? true,
                refundAllowedAtPurchase: p.refundAllowed ?? true,
              })),
            },
            timelineEvents: {
              create: {
                status: "ORDER_PLACED",
                actor: "CUSTOMER",
                note: `Order placed via ${paymentMethod || "gateway"}. Total: ৳${quote.totalBDT}`,
              },
            },
          },
          update: {
            userId: userRecord?.id || undefined,
            customerName,
            customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : "customer@aihaat.shop",
            customerPhone,
            subtotalBDT: quote.subtotalBDT,
            discountBDT: quote.discountBDT,
            totalBDT: quote.totalBDT,
            paymentMethod: paymentMethod || "gateway",
            updatedAt: now,
          },
        });

        // V9 FIX: Atomic coupon consumption INSIDE the transaction
        if (quote.couponId) {
          await tx.$executeRaw`
            UPDATE coupons SET usedCount = usedCount + 1 
            WHERE id = ${quote.couponId} AND usedCount < usageLimit
          `;
        }
      });
    } catch (prismaErr) {
      console.warn("[Prisma Order Create Error - Non-fatal]:", prismaErr);
    }

    // 3. Backup to JSON
    saveOrder(newOrder);

    // 3.0 Mark Abandoned Cart Converted (suppress recovery emails)
    if (customerEmail) {
      try {
        const { markCartConverted } = await import("@/lib/commerce/abandoned-cart");
        await markCartConverted(customerEmail, generatedNumber);
      } catch (cartConvErr) {
        console.warn("[Cart Conversion Guard Warning]:", cartConvErr);
      }
    }

    // 3.1 Affiliate Commission Attribution (non-blocking)
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      let refCode = body.refCode || body.referralCode;
      if (!refCode && cookieHeader.includes("aihaat_ref=")) {
        const match = cookieHeader.match(/aihaat_ref=([^;]+)/);
        if (match) refCode = decodeURIComponent(match[1]);
      }

      if (refCode) {
        const { attributeOrderToAffiliate } = await import("@/lib/commerce/affiliates");
        await attributeOrderToAffiliate(generatedNumber, refCode);
      }
    } catch (affErr) {
      console.warn("[Affiliate Order Attribution Warning]:", affErr);
    }

    // 4. Dispatch Centralized ORDER_CREATED Notification Event (In-App + Email)
    try {
      const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");
      await dispatchNotificationEvent({
        eventType: NOTIFICATION_EVENTS.ORDER_CREATED,
        entityType: "ORDER",
        entityId: generatedNumber,
        userId: userRecord?.id || undefined,
        recipientEmail: customerEmail,
        recipientPhone: customerPhone,
        dedupeKey: `order_created_${generatedNumber}`,
        payload: {
          orderId: generatedNumber,
          orderNumber: generatedNumber,
          customerName,
          customerEmail,
          customerPhone,
          items: (quote.items || []).map((p: any) => ({
            productName: p.productName,
            variationName: p.variationName,
            quantity: p.quantity,
            priceBDT: p.priceBDT,
          })),
          totalBDT: quote.totalBDT,
          paymentMethod: paymentMethod || "gateway",
          orderUrl: `https://aihaat.shop/dashboard/orders`,
        },
      });
    } catch (notifErr) {
      console.warn("[Order Created Notification Warning]:", notifErr);
    }

    // 5. Dispatch Telegram Alert (if configured)
    try {
      await sendNewOrderTelegramAlert({
        orderNumber: generatedNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "customer@aihaat.shop",
        items: quote.items || [],
        totalBDT: quote.totalBDT,
        paymentMethod: paymentMethod || "gateway",
        senderNumber: senderNumber || undefined,
        trxId: trxId || undefined,
        notes,
      });
    } catch (teleErr) {
      console.warn("[Telegram Dispatch Warning]:", teleErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("[Orders POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      paymentStatus,
      deliveryStatus,
      credentialsDelivered,
      deliveryInstructions,
      downloadUrl,
      cancelReason,
      adminNote,
    } = body;

    const targetId = orderNumber || orderId;
    if (!targetId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Fetch current order from DB to validate state transition
    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: targetId }, { id: targetId }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    const timelineNotes: string[] = [];

    // State transition checks
    if (paymentStatus) {
      const normalizedPayment =
        paymentStatus.toUpperCase() === "COMPLETED" || paymentStatus.toUpperCase() === "VERIFIED"
          ? "VERIFIED"
          : paymentStatus.toUpperCase() === "FAILED"
          ? "FAILED"
          : "PENDING";

      if (existing.paymentStatus !== normalizedPayment) {
        updateData.paymentStatus = normalizedPayment;
        timelineNotes.push(`Payment status changed from ${existing.paymentStatus} to ${normalizedPayment}`);
      }
    }

    if (deliveryStatus) {
      const normalizedDelivery =
        deliveryStatus.toUpperCase() === "DELIVERED"
          ? "DELIVERED"
          : deliveryStatus.toUpperCase() === "CANCELLED"
          ? "CANCELLED"
          : deliveryStatus.toUpperCase() === "PROCESSING"
          ? "PROCESSING"
          : deliveryStatus.toUpperCase() === "PREPARING"
          ? "PREPARING"
          : "ORDER_PLACED";

      // Validate legal transition: DELIVERED -> PENDING without revocation is blocked
      if (existing.deliveryStatus === "DELIVERED" && normalizedDelivery === "ORDER_PLACED") {
        return NextResponse.json(
          { error: "Illegal state transition: Cannot reset a DELIVERED order to ORDER_PLACED directly." },
          { status: 400 }
        );
      }

      if (existing.deliveryStatus !== normalizedDelivery) {
        updateData.deliveryStatus = normalizedDelivery;
        timelineNotes.push(`Delivery status changed from ${existing.deliveryStatus} to ${normalizedDelivery}`);
      }
    }

    if (adminNote) {
      const combinedNotes = existing.notes
        ? `${existing.notes}\n[Admin Note ${new Date().toLocaleDateString()}]: ${adminNote}`
        : `[Admin Note ${new Date().toLocaleDateString()}]: ${adminNote}`;
      updateData.notes = combinedNotes;
      timelineNotes.push(`Admin note added: "${adminNote}"`);
    }

    // Perform atomic update
    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: existing.id },
        data: updateData,
      });

      for (const note of timelineNotes) {
        await tx.orderTimelineEvent.create({
          data: {
            orderId: existing.id,
            status: updateData.deliveryStatus || existing.deliveryStatus,
            actor: "ADMIN",
            actorEmail: user.email,
            note,
          },
        });
      }

      return ord;
    });

    // Log admin audit event
    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "ORDER_STATUS_UPDATE",
      targetType: "ORDER",
      targetId: existing.orderNumber,
      details: {
        previousDeliveryStatus: existing.deliveryStatus,
        newDeliveryStatus: updateData.deliveryStatus,
        previousPaymentStatus: existing.paymentStatus,
        newPaymentStatus: updateData.paymentStatus,
        cancelReason: cancelReason || null,
      },
    });

    // Sync to JSON fallback
    updateOrderStatus(targetId, {
      paymentStatus,
      deliveryStatus,
      credentialsDelivered,
      deliveryInstructions,
      downloadUrl,
      cancelReason,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("[Orders PATCH Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order" }, { status: 500 });
  }
}
