import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "@/lib/mfa/crypto";
import { StockStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { action, stockIds, status } = body;

    if (!Array.isArray(stockIds) || stockIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "stockIds array is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (action === "STATUS") {
      const allowedStatuses: StockStatus[] = ["AVAILABLE", "EXPIRED", "INVALID"];
      if (!status || !allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Do not overwrite DELIVERED or REPLACED stock to protect customer order history
      const updateResult = await prisma.digitalStock.updateMany({
        where: {
          id: { in: stockIds },
          status: { notIn: ["DELIVERED", "REPLACED"] },
        },
        data: {
          status,
          ...(status === "AVAILABLE" ? { assignedOrderId: null, assignedOrderItemId: null } : {}),
        },
      });

      await prisma.securityAuditLog.create({
        data: {
          userId: user.id,
          event: "STEP_UP_OK",
          success: true,
          metadata: JSON.stringify({
            action: "ADMIN_STOCK_BULK_STATUS",
            stockIdsCount: stockIds.length,
            updatedCount: updateResult.count,
            newStatus: status,
            adminEmail: user.email,
          }),
        },
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        message: `Successfully updated ${updateResult.count} stock item(s) to ${status}.`,
        updatedCount: updateResult.count,
      });
    }

    if (action === "DELETE") {
      // Only delete unused stock (not DELIVERED or REPLACED)
      const deleteResult = await prisma.digitalStock.deleteMany({
        where: {
          id: { in: stockIds },
          status: { notIn: ["DELIVERED", "REPLACED"] },
        },
      });

      await prisma.securityAuditLog.create({
        data: {
          userId: user.id,
          event: "STEP_UP_OK",
          success: true,
          metadata: JSON.stringify({
            action: "ADMIN_STOCK_BULK_DELETE",
            stockIdsCount: stockIds.length,
            deletedCount: deleteResult.count,
            adminEmail: user.email,
          }),
        },
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${deleteResult.count} unused stock item(s).`,
        deletedCount: deleteResult.count,
      });
    }

    if (action === "EXPORT") {
      const items = await prisma.digitalStock.findMany({
        where: { id: { in: stockIds } },
        include: {
          product: { select: { name: true, slug: true } },
          variation: { select: { name: true } },
          order: { select: { orderNumber: true, customerEmail: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const exportRows = items.map((item) => {
        let plaintextPayload = "";
        try {
          plaintextPayload = decryptCredential(item.payloadEncrypted);
        } catch {
          plaintextPayload = "[Encrypted/Unreadable]";
        }

        return {
          id: item.id,
          productName: item.product.name,
          variationName: item.variation?.name || "Standard",
          type: item.type,
          status: item.status,
          batchRef: item.batchRef || "",
          costPriceBDT: item.costPriceBDT !== null && item.costPriceBDT !== undefined ? item.costPriceBDT : "",
          credentialOrPayload: plaintextPayload,
          assignedOrder: item.order?.orderNumber || "",
          customerEmail: item.order?.customerEmail || "",
          deliveredAt: item.deliveredAt ? item.deliveredAt.toISOString() : "",
          createdAt: item.createdAt.toISOString(),
        };
      });

      await prisma.securityAuditLog.create({
        data: {
          userId: user.id,
          event: "STEP_UP_OK",
          success: true,
          metadata: JSON.stringify({
            action: "ADMIN_STOCK_BULK_EXPORT",
            exportedCount: exportRows.length,
            adminEmail: user.email,
          }),
        },
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        items: exportRows,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported actions: STATUS, DELETE, EXPORT" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Admin Stock Bulk Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process bulk stock action" },
      { status: 500 }
    );
  }
}
