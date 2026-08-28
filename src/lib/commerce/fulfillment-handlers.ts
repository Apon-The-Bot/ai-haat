import { FulfillmentType } from "@prisma/client";
import { claimAvailableStock } from "@/lib/commerce/inventory";
import { encryptCredential } from "@/lib/mfa/crypto";

export interface FulfillmentContext {
  orderId: string;
  orderNumber: string;
  orderItemId: string;
  productId: string;
  variationId: string | null;
  productName: string;
  variationName: string;
  quantity: number;
  userId: string | null;
  customerEmail: string;
  customerName: string;
  warrantyDays: number;
  durationDays: number | null;
  instructions?: string | null;
  downloadUrl?: string | null;
}

export interface FulfillmentKeyResult {
  id: string;
  stockId?: string;
  productName: string;
  accountType: string;
  credentialsPlaintext: string;
  warrantyExpiresAt?: Date;
}

export interface FulfillmentResult {
  success: boolean;
  deliveryStatus: "DELIVERED" | "PROCESSING" | "CANCELLED";
  deliveredCount: number;
  deliveredKeys: FulfillmentKeyResult[];
  errorMessage?: string;
}

export interface IFulfillmentHandler {
  canHandle(type: FulfillmentType): boolean;
  validate(context: FulfillmentContext): Promise<{ valid: boolean; reason?: string }>;
  fulfill(tx: any, context: FulfillmentContext): Promise<FulfillmentResult>;
}

/**
 * Stock Fulfillment Handler (AUTO_STOCK):
 * Atomically claims available stock from the DigitalStock pool,
 * encrypts credentials at rest, and issues DeliveredKey records.
 */
export class StockFulfillmentHandler implements IFulfillmentHandler {
  canHandle(type: FulfillmentType): boolean {
    return type === "AUTO_STOCK";
  }

  async validate(context: FulfillmentContext): Promise<{ valid: boolean; reason?: string }> {
    if (!context.productId) {
      return { valid: false, reason: "Product ID is required for stock fulfillment." };
    }
    return { valid: true };
  }

  async fulfill(tx: any, context: FulfillmentContext): Promise<FulfillmentResult> {
    // 1. Check idempotency: count already delivered keys for this OrderItem
    const existingKeysCount = await tx.deliveredKey.count({
      where: { orderId: context.orderId, orderItemId: context.orderItemId },
    });

    if (existingKeysCount >= context.quantity) {
      return {
        success: true,
        deliveryStatus: "DELIVERED",
        deliveredCount: existingKeysCount,
        deliveredKeys: [],
      };
    }

    const needed = context.quantity - existingKeysCount;
    const claimedKeys: FulfillmentKeyResult[] = [];
    const now = new Date();
    const warrantyExpiresAt = new Date(now.getTime() + context.warrantyDays * 24 * 60 * 60 * 1000);

    for (let i = 0; i < needed; i++) {
      const claimed = await claimAvailableStock(
        tx,
        context.productId,
        context.variationId,
        context.orderId,
        context.orderItemId
      );

      if (claimed) {
        const encrypted = encryptCredential(claimed.credentials);
        const deliveredRecord = await tx.deliveredKey.create({
          data: {
            orderId: context.orderId,
            orderItemId: context.orderItemId,
            stockId: claimed.stockId,
            userId: context.userId,
            productName: context.productName,
            accountType: context.variationName || "Standard",
            credentials: "Encrypted at rest (Use Vault to view)",
            credentialsEncrypted: encrypted,
            instructions: context.instructions || "Use the credentials above to log in or activate your software.",
            warrantyExpiresAt,
            isReplacement: false,
          },
        });

        claimedKeys.push({
          id: deliveredRecord.id,
          stockId: claimed.stockId,
          productName: context.productName,
          accountType: context.variationName,
          credentialsPlaintext: claimed.credentials,
          warrantyExpiresAt,
        });
      }
    }

    const totalFulfilled = existingKeysCount + claimedKeys.length;
    const isFullyDelivered = totalFulfilled >= context.quantity;

    if (isFullyDelivered) {
      await tx.orderItem.update({
        where: { id: context.orderItemId },
        data: { deliveryStatus: "DELIVERED" },
      });
    } else if (claimedKeys.length > 0) {
      await tx.orderItem.update({
        where: { id: context.orderItemId },
        data: { deliveryStatus: "PROCESSING" },
      });
    }

    return {
      success: claimedKeys.length > 0,
      deliveryStatus: isFullyDelivered ? "DELIVERED" : "PROCESSING",
      deliveredCount: totalFulfilled,
      deliveredKeys: claimedKeys,
      errorMessage: !isFullyDelivered ? "Partial or out of stock in inventory pool." : undefined,
    };
  }
}

/**
 * Manual Fulfillment Handler:
 * Used for manual accounts, workspace invitations, external activations, and services.
 * Marks the item as PROCESSING so the admin team can fulfill via dashboard.
 */
export class ManualFulfillmentHandler implements IFulfillmentHandler {
  canHandle(type: FulfillmentType): boolean {
    return type === "MANUAL" || type === "WORKSPACE_INVITE" || type === "EXTERNAL_ACTIVATION";
  }

  async validate(context: FulfillmentContext): Promise<{ valid: boolean; reason?: string }> {
    return { valid: true };
  }

  async fulfill(tx: any, context: FulfillmentContext): Promise<FulfillmentResult> {
    await tx.orderItem.update({
      where: { id: context.orderItemId },
      data: { deliveryStatus: "PROCESSING" },
    });

    return {
      success: true,
      deliveryStatus: "PROCESSING",
      deliveredCount: 0,
      deliveredKeys: [],
    };
  }
}

/**
 * Protected Download Handler:
 * Used for secure digital files, assets, and software downloads.
 */
export class ProtectedDownloadHandler implements IFulfillmentHandler {
  canHandle(type: FulfillmentType): boolean {
    return type === "PROTECTED_DOWNLOAD";
  }

  async validate(context: FulfillmentContext): Promise<{ valid: boolean; reason?: string }> {
    return { valid: true };
  }

  async fulfill(tx: any, context: FulfillmentContext): Promise<FulfillmentResult> {
    const existing = await tx.deliveredKey.findFirst({
      where: { orderId: context.orderId, orderItemId: context.orderItemId },
    });

    if (existing) {
      return {
        success: true,
        deliveryStatus: "DELIVERED",
        deliveredCount: 1,
        deliveredKeys: [],
      };
    }

    const downloadPayload = context.downloadUrl || "https://aihaat.shop/dashboard/vault";
    const encrypted = encryptCredential(downloadPayload);

    const deliveredRecord = await tx.deliveredKey.create({
      data: {
        orderId: context.orderId,
        orderItemId: context.orderItemId,
        userId: context.userId,
        productName: context.productName,
        accountType: context.variationName || "Download Link",
        credentials: "Protected Download Access",
        credentialsEncrypted: encrypted,
        instructions: "Your digital asset is ready. Access the download link through your Vault.",
        isReplacement: false,
      },
    });

    await tx.orderItem.update({
      where: { id: context.orderItemId },
      data: { deliveryStatus: "DELIVERED" },
    });

    return {
      success: true,
      deliveryStatus: "DELIVERED",
      deliveredCount: 1,
      deliveredKeys: [
        {
          id: deliveredRecord.id,
          productName: context.productName,
          accountType: context.variationName,
          credentialsPlaintext: downloadPayload,
        },
      ],
    };
  }
}

// Registry of active handlers
const handlers: IFulfillmentHandler[] = [
  new StockFulfillmentHandler(),
  new ManualFulfillmentHandler(),
  new ProtectedDownloadHandler(),
];

/**
 * Dispatch fulfillment for an OrderItem using the appropriate handler
 */
export async function dispatchOrderItemFulfillment(
  tx: any,
  fulfillmentType: FulfillmentType,
  context: FulfillmentContext
): Promise<FulfillmentResult> {
  const handler = handlers.find((h) => h.canHandle(fulfillmentType));
  if (!handler) {
    // Default fallback to manual
    return new ManualFulfillmentHandler().fulfill(tx, context);
  }

  const validation = await handler.validate(context);
  if (!validation.valid) {
    return {
      success: false,
      deliveryStatus: "PROCESSING",
      deliveredCount: 0,
      deliveredKeys: [],
      errorMessage: validation.reason,
    };
  }

  return handler.fulfill(tx, context);
}
