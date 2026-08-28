import { requireAuth, requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "@/lib/mfa/crypto";
import { resolveActivationGuide } from "@/lib/commerce/activation-guides";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // SECURITY: Try admin MFA first, then fall back to regular auth for customers
  const adminAuth = await requireAdminMfa();
  let user: { id: string; email: string; role: string; name?: string };
  let isAdmin = false;

  if (adminAuth instanceof NextResponse) {
    // Not admin or MFA not verified — try regular auth for customer access
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    user = auth.user;
    isAdmin = false;
  } else {
    user = adminAuth.user;
    isAdmin = true;
  }

  const { searchParams } = new URL(req.url);
  const targetOrderId = searchParams.get("orderId");
  const targetDeliveryId = searchParams.get("id");

  try {
    const userEmailClean = user.email.toLowerCase().trim();

    // Strict composite ownership filter for customer queries
    const andFilters: any[] = [];

    if (!isAdmin) {
      andFilters.push({
        OR: [
          { userId: user.id },
          { user: { email: userEmailClean } },
          { order: { customerEmail: userEmailClean } },
          { order: { userId: user.id } },
        ],
      });
    }

    if (targetOrderId) {
      const cleanOrderId = targetOrderId.trim();
      andFilters.push({
        OR: [
          { orderId: cleanOrderId },
          { order: { orderNumber: cleanOrderId } },
        ],
      });
    }

    if (targetDeliveryId) {
      andFilters.push({ id: targetDeliveryId.trim() });
    }

    const whereClause = andFilters.length > 0 ? { AND: andFilters } : {};

    // 1. Fetch from Prisma MySQL DeliveredKey table
    const keys = await prisma.deliveredKey.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerEmail: true,
            customerName: true,
            createdAt: true,
            deliveryStatus: true,
            paymentStatus: true,
          },
        },
        orderItem: {
          select: {
            id: true,
            productId: true,
            productName: true,
            variationName: true,
            fulfillmentType: true,
            image: true,
            priceBDT: true,
            isRefunded: true,
            refunds: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        stock: {
          select: {
            type: true,
            expiryDate: true,
          },
        },
        replacementsAsOriginal: {
          select: {
            id: true,
            status: true,
            reason: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        deliveredAt: "desc",
      },
    });

    // Batch load associated products for slugs and categories
    const productIds = Array.from(
      new Set(keys.map((k) => k.orderItem?.productId).filter(Boolean) as string[])
    );
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, slug: true, category: true, warrantyDays: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    const now = new Date();

    const formattedKeys = keys.map((k) => {
      let plaintext = "";
      try {
        plaintext = decryptCredential(k.credentialsEncrypted || k.credentials);
      } catch {
        plaintext = k.credentials; // fallback to plaintext if legacy
      }

      // Determine stock/product type
      const inferredType = k.stock?.type || (
        k.accountType.toLowerCase().includes("license") || k.accountType.toLowerCase().includes("key")
          ? "LICENSE_KEY"
          : k.accountType.toLowerCase().includes("download")
          ? "DOWNLOAD_LINK"
          : "ACCOUNT_CREDENTIAL"
      );

      const productInfo = k.orderItem?.productId ? productMap.get(k.orderItem.productId) : null;

      // Determine warranty countdown metrics
      const isLifetime = !k.warrantyExpiresAt || new Date(k.warrantyExpiresAt).getFullYear() > 2099;
      let daysRemaining = 0;
      let hoursRemaining = 0;
      let isWarrantyActive = true;
      let isExpiringSoon = false;
      let warrantyPercentRemaining = 100;

      if (k.warrantyExpiresAt && !isLifetime) {
        const expiry = new Date(k.warrantyExpiresAt);
        const diffMs = expiry.getTime() - now.getTime();
        
        if (diffMs > 0) {
          daysRemaining = Math.floor(diffMs / (24 * 60 * 60 * 1000));
          hoursRemaining = Math.floor(diffMs / (60 * 60 * 1000));
          isWarrantyActive = true;
          isExpiringSoon = diffMs <= 3 * 24 * 60 * 60 * 1000; // <= 72 hours

          // Total duration for progress bar
          const deliveredAtDate = new Date(k.deliveredAt);
          const totalDurationMs = expiry.getTime() - deliveredAtDate.getTime();
          if (totalDurationMs > 0) {
            warrantyPercentRemaining = Math.max(0, Math.min(100, Math.round((diffMs / totalDurationMs) * 100)));
          }
        } else {
          isWarrantyActive = false;
          daysRemaining = 0;
          hoursRemaining = 0;
          isExpiringSoon = false;
          warrantyPercentRemaining = 0;
        }
      }

      const openReplacements = k.replacementsAsOriginal.filter(
        (r) => r.status === "REQUESTED" || r.status === "UNDER_REVIEW"
      );

      const openRefunds = (k.orderItem?.refunds || []).filter(
        (r) => r.status === "REQUESTED" || r.status === "UNDER_REVIEW" || r.status === "APPROVED" || r.status === "PROCESSING"
      );

      // Tailored product activation & setup guide
      const activationGuide = resolveActivationGuide({
        name: k.productName,
        category: productInfo?.category,
        accountType: k.accountType,
        productType: inferredType,
      });

      return {
        id: k.id,
        orderId: k.order?.orderNumber || k.orderId,
        orderItemId: k.orderItemId,
        productId: k.orderItem?.productId || null,
        productSlug: productInfo?.slug || null,
        productName: k.productName,
        variationName: k.orderItem?.variationName || k.accountType,
        accountType: k.accountType,
        category: productInfo?.category || "General",
        productType: inferredType,
        image: k.orderItem?.image,
        credentials: plaintext,
        instructions: k.instructions || null,
        warrantyExpiresAt: k.warrantyExpiresAt ? k.warrantyExpiresAt.toISOString() : null,
        isWarrantyActive,
        daysRemaining,
        hoursRemaining,
        warrantyPercentRemaining,
        isLifetime,
        isExpiringSoon,
        isReplacement: k.isReplacement,
        replacedDeliveryId: k.replacedDeliveryId,
        hasOpenReplacement: openReplacements.length > 0,
        hasOpenRefund: openRefunds.length > 0,
        isRefunded: !!k.orderItem?.isRefunded,
        purchasePrice: k.orderItem?.priceBDT || undefined,
        deliveredAt: k.deliveredAt.toISOString(),
        activationGuide,
      };
    });

    // 2. Legacy orders fallback if no keys in delivered_keys
    if (formattedKeys.length === 0 && !targetDeliveryId) {
      const legacyAndConditions: any[] = [{ deliveryStatus: "DELIVERED" }];

      if (!isAdmin) {
        legacyAndConditions.push({
          OR: [
            { userId: user.id },
            { customerEmail: userEmailClean },
          ],
        });
      }

      if (targetOrderId) {
        legacyAndConditions.push({
          OR: [
            { orderNumber: targetOrderId.trim() },
            { id: targetOrderId.trim() },
          ],
        });
      }

      const legacyOrders = await prisma.order.findMany({
        where: { AND: legacyAndConditions },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      for (const ord of legacyOrders) {
        if (ord.items && ord.items.length > 0) {
          for (const itm of ord.items) {
            const guide = resolveActivationGuide({
              name: itm.productName,
              accountType: itm.variationName,
            });

            formattedKeys.push({
              id: `legacy-${ord.id}-${itm.id}`,
              orderId: ord.orderNumber,
              orderItemId: itm.id,
              productId: itm.productId || null,
              productSlug: null,
              productName: itm.productName,
              variationName: itm.variationName || "Standard",
              accountType: itm.variationName || "Digital Access",
              category: "General",
              productType: "ACCOUNT_CREDENTIAL",
              image: itm.image,
              credentials: "Credentials and login access were dispatched to your registered email.",
              instructions: ord.notes || "Please check your order delivery email for activation steps.",
              warrantyExpiresAt: null,
              isWarrantyActive: true,
              daysRemaining: 365,
              hoursRemaining: 8760,
              warrantyPercentRemaining: 100,
              isLifetime: true,
              isExpiringSoon: false,
              isReplacement: false,
              replacedDeliveryId: null,
              hasOpenReplacement: false,
              hasOpenRefund: false,
              isRefunded: !!itm.isRefunded,
              purchasePrice: itm.priceBDT,
              deliveredAt: ord.updatedAt.toISOString(),
              activationGuide: guide,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, keys: formattedKeys });
  } catch (error: any) {
    console.error("[Vault Credentials API Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve credentials" }, { status: 500 });
  }
}
