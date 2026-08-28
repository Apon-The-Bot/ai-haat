import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export interface InAppNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  dedupeKey?: string;
}

export async function dispatchInAppNotification(params: InAppNotificationParams): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
  skippedDuplicate?: boolean;
}> {
  try {
    if (!params.userId) {
      return { success: false, error: "User ID is required for in-app notifications." };
    }

    // Deduplication check
    if (params.dedupeKey) {
      const existing = await prisma.notification.findUnique({
        where: {
          userId_dedupeKey: {
            userId: params.userId,
            dedupeKey: params.dedupeKey,
          },
        },
      });

      if (existing) {
        return {
          success: true,
          notificationId: existing.id,
          skippedDuplicate: true,
        };
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || "SYSTEM",
        link: params.link || "/dashboard",
        dedupeKey: params.dedupeKey || null,
        isRead: false,
      },
    });

    return {
      success: true,
      notificationId: notification.id,
    };
  } catch (error: any) {
    console.error("[In-App Channel Error]:", error?.message || error);
    return {
      success: false,
      error: error?.message || "Failed to create in-app notification",
    };
  }
}
