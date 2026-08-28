import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7D"; // TODAY, 7D, 30D, ALL

    // 1. Audience Metrics
    const [
      totalUsers,
      totalExtraContacts,
      suppressedCount,
      unsubscribedCount,
      totalCampaigns,
      scheduledCampaigns,
      draftCampaigns,
      sentCampaigns,
      allCampaigns,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.emailContact.count({ where: { userId: null } }),
      prisma.emailSuppression.count(),
      prisma.emailSuppression.count({ where: { reason: "UNSUBSCRIBED" } }),
      prisma.emailCampaign.count(),
      prisma.emailCampaign.count({ where: { status: "SCHEDULED" } }),
      prisma.emailCampaign.count({ where: { status: "DRAFT" } }),
      prisma.emailCampaign.count({ where: { status: "SENT" } }),
      prisma.emailCampaign.findMany({
        select: {
          id: true,
          name: true,
          subject: true,
          status: true,
          totalRecipients: true,
          sentCount: true,
          deliveredCount: true,
          openedCount: true,
          clickedCount: true,
          bouncedCount: true,
          failedCount: true,
          unsubscribedCount: true,
          scheduledAt: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalContacts = totalUsers + totalExtraContacts;
    const marketingSubscribers = Math.max(0, totalContacts - suppressedCount);

    // 2. Aggregate Totals
    let totalEmailsSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalBounced = 0;
    let totalFailed = 0;

    for (const c of allCampaigns) {
      totalEmailsSent += c.sentCount || 0;
      totalDelivered += c.deliveredCount || c.sentCount || 0;
      totalOpened += c.openedCount || 0;
      totalClicked += c.clickedCount || 0;
      totalBounced += c.bouncedCount || 0;
      totalFailed += c.failedCount || 0;
    }

    const deliveryRate = totalEmailsSent > 0 ? Math.round((totalDelivered / totalEmailsSent) * 100) : 100;
    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
    const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;
    const bounceRate = totalEmailsSent > 0 ? Math.round((totalBounced / totalEmailsSent) * 100) : 0;
    const unsubscribeRate = totalEmailsSent > 0 ? Math.round((unsubscribedCount / totalEmailsSent) * 100) : 0;

    // 3. Daily Trend Generation
    const daysCount = period === "TODAY" ? 1 : period === "30D" ? 30 : period === "ALL" ? 60 : 7;
    const dailyTrend: Array<{ date: string; sent: number; opened: number; clicked: number }> = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Aggregate for this day
      const dayCampaigns = allCampaigns.filter((c) => {
        const cDate = new Date(c.createdAt);
        return cDate.toDateString() === d.toDateString();
      });

      const daySent = dayCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
      const dayOpened = dayCampaigns.reduce((sum, c) => sum + (c.openedCount || 0), 0);
      const dayClicked = dayCampaigns.reduce((sum, c) => sum + (c.clickedCount || 0), 0);

      dailyTrend.push({
        date: dateStr,
        sent: daySent,
        opened: dayOpened,
        clicked: dayClicked,
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalContacts,
        marketingSubscribers,
        unsubscribedCount,
        suppressedCount,
        totalCampaigns,
        scheduledCampaigns,
        draftCampaigns,
        sentCampaigns,
        totalEmailsSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalBounced,
        totalFailed,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        unsubscribeRate,
        dailyTrend,
        recentCampaigns: allCampaigns.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error("[EmailMarketing Stats Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load marketing statistics" },
      { status: 500 }
    );
  }
}