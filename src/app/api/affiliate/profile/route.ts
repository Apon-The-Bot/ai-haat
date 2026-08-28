import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getOrCreateAffiliateProfile, calculateAffiliateTier } from "@/lib/commerce/affiliates";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;

    const profile = await getOrCreateAffiliateProfile(user.id);
    const tierInfo = calculateAffiliateTier(profile);

    const referralLink = `https://aihaat.shop?ref=${profile.referralCode}`;
    
    // Generate QR Code data URL for instant scanning
    let qrCodeUrl = "";
    try {
      qrCodeUrl = await QRCode.toDataURL(referralLink, {
        width: 320,
        margin: 2,
        color: {
          dark: "#1A1D26",
          light: "#FFFFFF",
        },
      });
    } catch (qrErr) {
      console.warn("QR code generation failed:", qrErr);
    }

    const [recentCommissions, recentPayouts, holdingAgg] = await Promise.all([
      prisma.affiliateCommission.findMany({
        where: { affiliateProfileId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          order: {
            select: { 
              orderNumber: true, 
              createdAt: true,
              items: {
                select: { productName: true }
              }
            },
          },
        },
      }),
      prisma.affiliatePayoutRequest.findMany({
        where: { affiliateProfileId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.affiliateCommission.aggregate({
        where: {
          affiliateProfileId: profile.id,
          status: "PENDING",
        },
        _sum: {
          commissionAmountBDT: true,
        },
      }),
    ]);

    const holdingBalance = holdingAgg._sum?.commissionAmountBDT || 0;
    const conversionRate = profile.totalClicks > 0 
      ? Math.round((profile.totalOrdersCount / profile.totalClicks) * 1000) / 10 
      : 0;

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        referralLink,
        qrCodeUrl,
        tierInfo,
      },
      stats: {
        clicks: profile.totalClicks,
        conversionsCount: profile.totalOrdersCount,
        conversionRate,
        earningsBalance: profile.earningsBalanceBDT,
        availableEarnings: profile.earningsBalanceBDT,
        holdingBalance,
        totalEarned: profile.totalEarnedBDT,
        totalPaid: profile.totalPaidBDT,
        totalGMV: profile.totalReferredGMVBDT,
        recentCommissions,
        recentPayouts,
      },
    });
  } catch (error: any) {
    console.error("GET /api/affiliate/profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

