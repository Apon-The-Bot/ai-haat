import { prisma } from "@/lib/prisma";
import { claimAvailableStock } from "@/lib/commerce/inventory";
import { encryptCredential, decryptCredential } from "@/lib/mfa/crypto";
import { sendOrderDeliveryEmail } from "@/utils/email";
import { sendTelegramMessage, sendReplacementTelegramAlert } from "@/utils/telegram";
import { calculateReplacementEligibility } from "@/lib/commerce/warranty";

/**
 * Submit a customer replacement request from Digital Vault with Instant Auto-Replacement capability
 */
export async function createReplacementRequest(data: {
  userId: string;
  orderId: string;
  orderItemId?: string | null;
  originalDeliveryId: string;
  reason: string;
  description: string;
  adminOverride?: boolean;
  autoFulfillIfAvailable?: boolean;
}) {
  const { autoFulfillIfAvailable = true } = data;

  // 1. Verify original delivery ownership (support user ID, email, order ID, or orderNumber)
  const delivery = await prisma.deliveredKey.findFirst({
    where: {
      id: data.originalDeliveryId,
      AND: [
        {
          OR: [
            { orderId: data.orderId },
            { order: { orderNumber: data.orderId } },
          ],
        },
        {
          OR: [
            { userId: data.userId },
            { user: { id: data.userId } },
            { order: { userId: data.userId } },
          ],
        },
      ],
    },
    include: {
      order: true,
      orderItem: true,
      replacementsAsOriginal: {
        where: {
          status: { in: ["REQUESTED", "UNDER_REVIEW"] },
        },
      },
    },
  });

  if (!delivery) {
    throw new Error("Delivered product not found or unauthorized access.");
  }

  // 2. Check warranty & replacement eligibility using centralized calculator
  const eligibility = calculateReplacementEligibility(
    {
      warrantyExpiresAt: delivery.warrantyExpiresAt,
      isReplacement: delivery.isReplacement,
      replacementsAsOriginal: delivery.replacementsAsOriginal,
    },
    delivery.orderItem
  );

  if (!data.adminOverride && !eligibility.isEligible) {
    throw new Error(eligibility.reason || "This product is not currently eligible for replacement.");
  }

  const productId = delivery.orderItem?.productId;
  const variationId = delivery.orderItem?.variationId || null;

  // 3. ATTEMPT INSTANT AUTO-REPLACEMENT IF STOCK IS AVAILABLE
  if (autoFulfillIfAvailable && productId) {
    try {
      let claimedStock: { stockId: string; type: string; credentials: string } | null = null;
      let newDeliveryRecord: any = null;
      let completedRequest: any = null;

      const fulfilled = await prisma.$transaction(async (tx) => {
        // Attempt to claim available stock item atomically
        claimedStock = await claimAvailableStock(
          tx,
          productId,
          variationId,
          delivery.orderId,
          delivery.orderItemId || undefined
        );

        if (!claimedStock) {
          // No stock in pool -> transaction will finish without claiming
          return false;
        }

        // Invalidate previous stock if linked
        if (delivery.stockId) {
          await tx.digitalStock.updateMany({
            where: { id: delivery.stockId },
            data: {
              status: "REPLACED",
              replacedAt: new Date(),
            },
          });
        }

        // Create new replacement DeliveredKey
        newDeliveryRecord = await tx.deliveredKey.create({
          data: {
            orderId: delivery.orderId,
            orderItemId: delivery.orderItemId,
            stockId: claimedStock.stockId,
            userId: delivery.userId || data.userId,
            productName: delivery.productName,
            accountType: delivery.accountType,
            credentials: "Encrypted at rest",
            credentialsEncrypted: encryptCredential(claimedStock.credentials),
            instructions: "Instant replacement credentials issued automatically by AI Haat Warranty Engine.",
            warrantyExpiresAt: delivery.warrantyExpiresAt,
            isReplacement: true,
            replacedDeliveryId: delivery.id,
          },
        });

        // Create ReplacementRequest marked COMPLETED
        completedRequest = await tx.replacementRequest.create({
          data: {
            userId: data.userId,
            orderId: delivery.orderId,
            orderItemId: data.orderItemId || delivery.orderItemId || null,
            originalDeliveryId: data.originalDeliveryId,
            reason: data.reason,
            description: data.description.trim(),
            status: "COMPLETED",
            adminNotes: "Auto-fulfilled immediately from available stock pool.",
            reviewedBy: "SYSTEM_AUTO_WARRANTY",
            reviewedAt: new Date(),
            replacementDeliveryId: newDeliveryRecord.id,
            assignedStockId: claimedStock.stockId,
          },
        });

        // Add timeline event to order
        await tx.orderTimelineEvent.create({
          data: {
            orderId: delivery.orderId,
            status: "REPLACEMENT_AUTO_DISPATCHED",
            actor: "SYSTEM",
            note: `Instant auto-replacement dispatched for ${delivery.productName} (${delivery.accountType}). Reason: ${data.reason}`,
          },
        }).catch(console.error);

        // Notify user in-app
        await tx.notification.create({
          data: {
            userId: data.userId,
            title: "ইনস্ট্যান্ট রিপ্লেসমেন্ট সম্পন্ন হয়েছে! (Instant Key Replacement)",
            message: `আপনার #${delivery.order.orderNumber || delivery.orderId} অর্ডারের জন্য ইনস্ট্যান্ট নতুন লাইসেন্স কি/ক্রেডেনশিয়াল ভল্টে যোগ করা হয়েছে।`,
            type: "DELIVERY",
            link: "/dashboard/keys",
          },
        }).catch(console.error);

        return true;
      });

      if (fulfilled && completedRequest && newDeliveryRecord && claimedStock) {
        // Send email to customer asynchronously
        const creds = (claimedStock as any).credentials;
        await sendOrderDeliveryEmail({
          customerName: delivery.order.customerName || "Valued Customer",
          customerEmail: delivery.order.customerEmail,
          orderId: `${delivery.order.orderNumber} (Instant Replacement)`,
          productName: delivery.productName,
          variationName: delivery.accountType,
          credentials: creds,
          instructions: "Your instant replacement has been activated under warranty. View your keys anytime in your Digital Vault.",
        }).catch(console.error);

        return {
          success: true,
          autoReplaced: true,
          status: "COMPLETED" as const,
          request: completedRequest,
          newDelivery: newDeliveryRecord,
          message: "Instant replacement key generated and delivered to your Vault!",
        };
      }
    } catch (autoErr) {
      console.warn("[Auto-Replacement Fallback to Queue]:", autoErr);
    }
  }

  // 4. FALLBACK: QUEUE CLAIM FOR ADMIN REVIEW WHEN STOCK IS NOT AVAILABLE
  const queuedRequest = await prisma.$transaction(async (tx) => {
    const claim = await tx.replacementRequest.create({
      data: {
        userId: data.userId,
        orderId: delivery.orderId,
        orderItemId: data.orderItemId || delivery.orderItemId || null,
        originalDeliveryId: data.originalDeliveryId,
        reason: data.reason,
        description: data.description.trim(),
        status: "REQUESTED",
      },
    });

    await tx.orderTimelineEvent.create({
      data: {
        orderId: delivery.orderId,
        status: "REPLACEMENT_REQUESTED",
        actor: "CUSTOMER",
        actorEmail: delivery.order.customerEmail,
        note: `Customer requested warranty replacement. Reason: ${data.reason}`,
      },
    }).catch(console.error);

    await tx.notification.create({
      data: {
        userId: data.userId,
        title: "রিপ্লেসমেন্ট রিকোয়েস্ট গ্রহণ করা হয়েছে",
        message: `আপনার অর্ডার #${delivery.order.orderNumber || delivery.orderId} এর (${delivery.productName}) রিপ্লেসমেন্ট ক্লেইম গ্রহণ করা হয়েছে। এডমিন টিম শীঘ্রই নতুন কি প্রদান করবে।`,
        type: "DELIVERY",
        link: "/dashboard/keys",
      },
    }).catch(console.error);

    return claim;
  });

  // Alert admin on Telegram
  try {
    await sendReplacementTelegramAlert({
      orderNumber: delivery.order.orderNumber || delivery.order.id,
      productName: delivery.productName,
      variationName: delivery.accountType,
      customerName: delivery.order.customerName || "Customer",
      customerEmail: delivery.order.customerEmail,
      reason: data.reason,
      description: data.description.trim(),
    });
  } catch (tgErr) {
    console.warn("[Telegram Replacement Alert Error]:", tgErr);
  }

  return {
    success: true,
    autoReplaced: false,
    status: "REQUESTED" as const,
    request: queuedRequest,
    message: "Replacement request submitted successfully. Our team will verify and dispatch new credentials shortly.",
  };
}

/**
 * Review and fulfill replacement request (Admin Action)
 */
export async function reviewReplacementRequest(data: {
  requestId: string;
  adminEmail: string;
  action: "APPROVE" | "REJECT";
  adminNotes?: string;
  replacementStockId?: string;
  adminOverride?: boolean;
}) {
  const request = await prisma.replacementRequest.findUnique({
    where: { id: data.requestId },
    include: {
      user: true,
      order: true,
      orderItem: true,
      originalDelivery: true,
    },
  });

  if (!request) {
    throw new Error("Replacement request not found.");
  }

  if (request.status === "COMPLETED" || request.status === "REJECTED") {
    throw new Error(`Request has already been processed with status ${request.status}.`);
  }

  // Check if out of warranty
  const now = new Date();
  const isOutOfWarranty = request.originalDelivery.warrantyExpiresAt && request.originalDelivery.warrantyExpiresAt < now;
  
  if (data.action === "APPROVE" && isOutOfWarranty && !data.adminOverride) {
    throw new Error("Cannot approve replacement. Warranty has expired. Use adminOverride to bypass.");
  }
  
  let finalAdminNotes = data.adminNotes || "";
  if (data.action === "APPROVE" && isOutOfWarranty && data.adminOverride) {
    finalAdminNotes = `Admin warranty override: ${data.adminNotes || "Approved beyond warranty."}`;
  }

  // 1. REJECT ACTION
  if (data.action === "REJECT") {
    const updated = await prisma.replacementRequest.update({
      where: { id: request.id },
      data: {
        status: "REJECTED",
        adminNotes: data.adminNotes || "Request did not meet warranty terms.",
        reviewedBy: data.adminEmail,
        reviewedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: "রিপ্লেসমেন্ট রিকোয়েস্ট প্রত্যাখ্যাত",
        message: `আপনার অর্ডার #${request.order.orderNumber} এর রিপ্লেসমেন্ট রিকোয়েস্টটি গৃহীত হয়নি। কারণ: ${data.adminNotes || "যাচাইকরণ ব্যর্থ"}`,
        type: "DELIVERY",
        link: "/dashboard/keys",
      },
    }).catch(console.error);

    return { success: true, status: "REJECTED" as const, request: updated };
  }

  // 2. APPROVE ACTION -> CLAIM REPLACEMENT STOCK & FULFILL
  let claimedStock: { stockId: string; type: string; credentials: string } | null = null;
  let newDeliveryRecord: any = null;

  await prisma.$transaction(async (tx) => {
    // 2a. Invalidate / mark old stock as REPLACED
    if (request.originalDelivery.stockId) {
      await tx.digitalStock.updateMany({
        where: { id: request.originalDelivery.stockId },
        data: {
          status: "REPLACED",
          replacedAt: new Date(),
        },
      });
    }

    // 2b. Claim new stock item
    const productId = request.orderItem?.productId;
    const variationId = request.orderItem?.variationId;

    if (data.replacementStockId) {
      // Use specific stock item selected by admin
      const specificStock = await tx.digitalStock.findUnique({
        where: { id: data.replacementStockId },
      });
      if (specificStock && (specificStock.status === "AVAILABLE" || specificStock.status === "RESERVED")) {
        await tx.digitalStock.update({
          where: { id: specificStock.id },
          data: {
            status: "DELIVERED",
            assignedOrderId: request.orderId,
            assignedOrderItemId: request.orderItemId || null,
            deliveredAt: new Date(),
          },
        });
        let plain = "";
        try {
          plain = decryptCredential(specificStock.payloadEncrypted);
        } catch {
          plain = specificStock.payloadEncrypted;
        }
        claimedStock = {
          stockId: specificStock.id,
          type: specificStock.type,
          credentials: plain,
        };
      }
    } else if (productId) {
      claimedStock = await claimAvailableStock(
        tx,
        productId,
        variationId || null,
        request.orderId,
        request.orderItemId || undefined
      );
    }

    if (!claimedStock) {
      throw new Error("No available stock in pool to fulfill replacement. Please add stock first.");
    }

    // 2c. Create new DeliveredKey record linked to replacement
    newDeliveryRecord = await tx.deliveredKey.create({
      data: {
        orderId: request.orderId,
        orderItemId: request.orderItemId,
        stockId: claimedStock.stockId,
        userId: request.userId,
        productName: request.originalDelivery.productName,
        accountType: request.originalDelivery.accountType,
        credentials: "Encrypted at rest",
        credentialsEncrypted: encryptCredential(claimedStock.credentials),
        instructions: "Replacement credentials provided by AI Haat Warranty Service.",
        warrantyExpiresAt: request.originalDelivery.warrantyExpiresAt,
        isReplacement: true,
        replacedDeliveryId: request.originalDelivery.id,
      },
    });

    // 2d. Mark ReplacementRequest COMPLETED
    await tx.replacementRequest.update({
      where: { id: request.id },
      data: {
        status: "COMPLETED",
        adminNotes: finalAdminNotes || "Replacement approved and dispatched from stock pool.",
        reviewedBy: data.adminEmail,
        reviewedAt: new Date(),
        replacementDeliveryId: newDeliveryRecord.id,
        assignedStockId: claimedStock.stockId,
      },
    });

    // 2e. Timeline Event
    await tx.orderTimelineEvent.create({
      data: {
        orderId: request.orderId,
        status: "REPLACEMENT_DISPATCHED",
        actor: "ADMIN",
        actorEmail: data.adminEmail,
        note: `Replacement dispatched for ${request.originalDelivery.productName}.${finalAdminNotes ? " " + finalAdminNotes : ""}`,
      },
    }).catch(console.error);
  });

  // 3. Notify Customer
  await prisma.notification.create({
    data: {
      userId: request.userId,
      title: "রিপ্লেসমেন্ট সম্পন্ন হয়েছে! (New Credentials)",
      message: `আপনার অর্ডার #${request.order.orderNumber} এর রিপ্লেসমেন্ট কি / একাউন্ট সফলভাবে ডিসপ্যাচ হয়েছে। ভল্ট চেক করুন।`,
      type: "DELIVERY",
      link: "/dashboard/keys",
    },
  }).catch(console.error);

  // 4. Send Email to Customer
  if (claimedStock) {
    const creds = (claimedStock as any).credentials;
    await sendOrderDeliveryEmail({
      customerName: request.order.customerName || "Customer",
      customerEmail: request.order.customerEmail,
      orderId: `${request.order.orderNumber} (Replacement)`,
      productName: request.originalDelivery.productName,
      variationName: request.originalDelivery.accountType,
      credentials: creds,
      instructions: "Your replacement has been issued under warranty. Access your Digital Vault anytime.",
    }).catch(console.error);
  }

  return { success: true, status: "COMPLETED" as const, newDelivery: newDeliveryRecord };
}
