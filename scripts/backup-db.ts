/**
 * AI Haat Automated Database Backup Utility
 * Exports critical business tables into timestamped JSON snapshot files
 * Usage: npx tsx scripts/backup-db.ts
 */

import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `aihaat-backup-${timestamp}.json`);

  console.log(`[Backup] Starting AI Haat database backup...`);

  try {
    const [
      users,
      categories,
      coupons,
      orders,
      orderItems,
      digitalStock,
      deliveredKeys,
      replacements,
      reviews,
      productRequests,
      walletTransactions,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.category.findMany(),
      prisma.coupon.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.digitalStock.findMany(),
      prisma.deliveredKey.findMany(),
      prisma.replacementRequest.findMany(),
      prisma.review.findMany(),
      prisma.productRequest.findMany(),
      prisma.walletTransaction.findMany(),
      prisma.adminAuditLog.findMany(),
    ]);

    const backupData = {
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        domain: "aihaat.shop",
        totalEntities: {
          users: users.length,
          categories: categories.length,
          coupons: coupons.length,
          orders: orders.length,
          orderItems: orderItems.length,
          digitalStock: digitalStock.length,
          deliveredKeys: deliveredKeys.length,
          replacements: replacements.length,
          reviews: reviews.length,
          productRequests: productRequests.length,
          walletTransactions: walletTransactions.length,
          auditLogs: auditLogs.length,
        },
      },
      data: {
        users,
        categories,
        coupons,
        orders,
        orderItems,
        digitalStock,
        deliveredKeys,
        replacements,
        reviews,
        productRequests,
        walletTransactions,
        auditLogs,
      },
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");

    console.log(`[Backup] ✅ Database snapshot exported successfully!`);
    console.log(`[Backup] File: ${backupFilePath}`);
    console.log(`[Backup] Summary:`, backupData.meta.totalEntities);
  } catch (error) {
    console.error(`[Backup] ❌ Failed to export database backup:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
