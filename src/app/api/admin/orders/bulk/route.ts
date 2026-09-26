import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { updateOrderStatus, deleteOrder } from "@/lib/orders-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await req.json();
    const { action, orderIds, paymentStatus, deliveryStatus, cancelReason } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, error: "orderIds must be a non-empty array" }, { status: 400 });
    }

    // Limit batch size to 200 items for safety
    if (orderIds.length > 200) {
      return NextResponse.json({ success: false, error: "Maximum 200 orders allowed per bulk operation" }, { status: 400 });
    }

    // Lookup matching orders in database
    const existingOrders = await prisma.order.findMany({
      where: {
        OR: [
          { id: { in: orderIds } },
          { orderNumber: { in: orderIds } },
        ],
      },
      include: {
        items: true,
        deliveredKeys: true,
      },
    });

    if (existingOrders.length === 0) {
      return NextResponse.json({ success: false, error: "No matching orders found" }, { status: 404 });
    }

    const matchedDbIds = existingOrders.map((o) => o.id);
    const matchedOrderNumbers = existingOrders.map((o) => o.orderNumber);

    // 1. BULK STATUS UPDATE
    if (action === "STATUS") {
      if (!paymentStatus && !deliveryStatus) {
        return NextResponse.json(
          { success: false, error: "paymentStatus or deliveryStatus must be provided for STATUS action" },
          { status: 400 }
        );
      }

      const updateData: any = { updatedAt: new Date() };
      let normalizedPayment: "VERIFIED" | "PENDING" | "FAILED" | undefined;
      let normalizedDelivery: "DELIVERED" | "PROCESSING" | "CANCELLED" | "ORDER_PLACED" | "PREPARING" | undefined;

      if (paymentStatus) {
        const p = paymentStatus.toUpperCase();
        if (p === "VERIFIED" || p === "COMPLETED") normalizedPayment = "VERIFIED";
        else if (p === "FAILED") normalizedPayment = "FAILED";
        else if (p === "PENDING") normalizedPayment = "PENDING";
        else {
          return NextResponse.json({ success: false, error: `Invalid paymentStatus: ${paymentStatus}` }, { status: 400 });
        }
        updateData.paymentStatus = normalizedPayment;
      }

      if (deliveryStatus) {
        const d = deliveryStatus.toUpperCase();
        if (d === "DELIVERED") normalizedDelivery = "DELIVERED";
        else if (d === "PROCESSING") normalizedDelivery = "PROCESSING";
        else if (d === "CANCELLED") normalizedDelivery = "CANCELLED";
        else if (d === "ORDER_PLACED") normalizedDelivery = "ORDER_PLACED";
        else if (d === "PREPARING") normalizedDelivery = "PREPARING";
        else {
          return NextResponse.json({ success: false, error: `Invalid deliveryStatus: ${deliveryStatus}` }, { status: 400 });
        }
        updateData.deliveryStatus = normalizedDelivery;
      }

      await prisma.$transaction(async (tx) => {
        // Bulk update
        await tx.order.updateMany({
          where: { id: { in: matchedDbIds } },
          data: updateData,
        });

        // Add timeline events for all updated orders
        for (const order of existingOrders) {
          const notes: string[] = [];
          if (normalizedPayment && order.paymentStatus !== normalizedPayment) {
            notes.push(`Bulk payment status changed from ${order.paymentStatus} to ${normalizedPayment}`);
          }
          if (normalizedDelivery && order.deliveryStatus !== normalizedDelivery) {
            notes.push(`Bulk delivery status changed from ${order.deliveryStatus} to ${normalizedDelivery}`);
          }

          for (const note of notes) {
            await tx.orderTimelineEvent.create({
              data: {
                orderId: order.id,
                status: normalizedDelivery || order.deliveryStatus,
                actor: "ADMIN",
                actorEmail: user.email,
                note,
              },
            });
          }
        }
      });

      // Synchronize with JSON fallback
      for (const order of existingOrders) {
        const jsonUpdates: any = {};
        if (normalizedPayment) {
          jsonUpdates.paymentStatus = normalizedPayment === "VERIFIED" ? "Completed" : normalizedPayment === "FAILED" ? "Failed" : "Pending";
        }
        if (normalizedDelivery) {
          jsonUpdates.deliveryStatus =
            normalizedDelivery === "DELIVERED"
              ? "Delivered"
              : normalizedDelivery === "CANCELLED"
              ? "Cancelled"
              : normalizedDelivery === "PROCESSING"
              ? "Processing"
              : normalizedDelivery === "PREPARING"
              ? "Preparing"
              : "Order Placed";
        }
        updateOrderStatus(order.orderNumber, jsonUpdates);
      }

      // Log admin audit
      await logAdminAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "ORDER_STATUS_UPDATE",
        targetType: "ORDER",
        targetId: `BULK (${existingOrders.length} orders)`,
        details: {
          count: existingOrders.length,
          orderNumbers: matchedOrderNumbers,
          appliedPaymentStatus: normalizedPayment || null,
          appliedDeliveryStatus: normalizedDelivery || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${existingOrders.length} order(s)`,
        updatedCount: existingOrders.length,
      });
    }

    // 2. BULK EXPORT CSV
    if (action === "EXPORT") {
      const headers = [
        "Order Number",
        "Created At",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Products Summary",
        "Total (BDT)",
        "Payment Method",
        "TrxID",
        "Payment Status",
        "Delivery Status",
      ];

      const rows = existingOrders.map((o) => {
        const productSummary = (o.items || [])
          .map((it) => `${it.productName} (${it.variationName}) x${it.quantity}`)
          .join("; ")
          .replace(/"/g, '""');

        return [
          `"${o.orderNumber}"`,
          `"${o.createdAt.toISOString()}"`,
          `"${(o.customerName || "").replace(/"/g, '""')}"`,
          `"${o.customerEmail || ""}"`,
          `"${o.customerPhone || ""}"`,
          `"${productSummary}"`,
          o.totalBDT,
          `"${o.paymentMethod || ""}"`,
          `"${o.trxId || "N/A"}"`,
          `"${o.paymentStatus}"`,
          `"${o.deliveryStatus}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const filename = `AI_Haat_Selected_Orders_${new Date().toISOString().split("T")[0]}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // 3. BULK CANCEL
    if (action === "CANCEL") {
      const reason = cancelReason || "Cancelled via admin bulk action";

      // Safety check: Filter out already delivered orders with credentials delivered unless overridden
      const eligibleToCancel = existingOrders.filter((o) => o.deliveryStatus !== "DELIVERED");
      const blockedCount = existingOrders.length - eligibleToCancel.length;

      if (eligibleToCancel.length === 0) {
        return NextResponse.json({
          success: false,
          error: "All selected orders are already DELIVERED and cannot be cancelled automatically. Revoke credentials first.",
        }, { status: 400 });
      }

      const eligibleIds = eligibleToCancel.map((o) => o.id);

      await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: { id: { in: eligibleIds } },
          data: {
            deliveryStatus: "CANCELLED",
            paymentStatus: "FAILED",
            updatedAt: new Date(),
          },
        });

        for (const order of eligibleToCancel) {
          await tx.orderTimelineEvent.create({
            data: {
              orderId: order.id,
              status: "CANCELLED",
              actor: "ADMIN",
              actorEmail: user.email,
              note: `Bulk cancelled by admin: ${reason}`,
            },
          });
        }
      });

      // Synchronize with JSON fallback
      for (const order of eligibleToCancel) {
        updateOrderStatus(order.orderNumber, {
          deliveryStatus: "Cancelled",
          paymentStatus: "Failed",
          cancelReason: reason,
        });
      }

      await logAdminAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "ORDER_CANCEL",
        targetType: "ORDER",
        targetId: `BULK (${eligibleToCancel.length} cancelled)`,
        details: {
          cancelledCount: eligibleToCancel.length,
          blockedCount,
          cancelledOrderNumbers: eligibleToCancel.map((o) => o.orderNumber),
          cancelReason: reason,
        },
      });

      return NextResponse.json({
        success: true,
        message: blockedCount > 0
          ? `Cancelled ${eligibleToCancel.length} order(s). ${blockedCount} delivered order(s) were protected from cancellation.`
          : `Successfully cancelled ${eligibleToCancel.length} order(s).`,
        cancelledCount: eligibleToCancel.length,
        blockedCount,
      });
    }

    // 4. BULK DELETE (Permanent removal with safety checks)
    if (action === "DELETE") {
      // Safety check: Only CANCELLED or FAILED orders with NO delivered keys can be permanently deleted
      const safeToDelete = existingOrders.filter(
        (o) => (o.deliveryStatus === "CANCELLED" || o.paymentStatus === "FAILED") && o.deliveredKeys.length === 0
      );

      const unsafeCount = existingOrders.length - safeToDelete.length;
      if (safeToDelete.length === 0) {
        return NextResponse.json({
          success: false,
          error: "Safety block: Only CANCELLED or FAILED orders with no delivered license keys can be permanently deleted.",
        }, { status: 400 });
      }

      const safeIds = safeToDelete.map((o) => o.id);

      await prisma.$transaction(async (tx) => {
        // Delete related child entities first if necessary
        await tx.orderTimelineEvent.deleteMany({
          where: { orderId: { in: safeIds } },
        });
        await tx.orderItem.deleteMany({
          where: { orderId: { in: safeIds } },
        });
        await tx.order.deleteMany({
          where: { id: { in: safeIds } },
        });
      });

      // Synchronize with JSON fallback
      for (const order of safeToDelete) {
        deleteOrder(order.orderNumber);
      }

      await logAdminAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "ORDER_STATUS_UPDATE",
        targetType: "ORDER",
        targetId: `BULK DELETE (${safeToDelete.length} deleted)`,
        details: {
          deletedCount: safeToDelete.length,
          skippedUnsafeCount: unsafeCount,
          deletedOrderNumbers: safeToDelete.map((o) => o.orderNumber),
        },
      });

      return NextResponse.json({
        success: true,
        message: unsafeCount > 0
          ? `Permanently deleted ${safeToDelete.length} order(s). ${unsafeCount} active or delivered order(s) were protected.`
          : `Permanently deleted ${safeToDelete.length} order(s).`,
        deletedCount: safeToDelete.length,
        unsafeCount,
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action '${action}'` }, { status: 400 });
  } catch (error: any) {
    console.error("[Bulk Orders API Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to execute bulk action" }, { status: 500 });
  }
}
