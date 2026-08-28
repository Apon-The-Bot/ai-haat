import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const user = auth.user;
    const cleanEmail = user.email.toLowerCase().trim();

    const [contact, suppression] = await Promise.all([
      prisma.emailContact.findUnique({
        where: { email: cleanEmail },
      }),
      prisma.emailSuppression.findUnique({
        where: { email: cleanEmail },
      }),
    ]);

    const isSuppressed = Boolean(suppression);

    return NextResponse.json({
      success: true,
      preferences: {
        isSubscribed: contact ? contact.isSubscribed : !isSuppressed,
        promotionalConsent: contact ? contact.promotionalConsent : !isSuppressed,
        productUpdateConsent: contact ? contact.productUpdateConsent : true,
        newsletterConsent: contact ? contact.newsletterConsent : true,
        isSuppressed,
      },
    });
  } catch (error: any) {
    console.error("[Preferences GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const user = auth.user;
    const cleanEmail = user.email.toLowerCase().trim();
    const body = await req.json();
    const { promotionalConsent, productUpdateConsent, newsletterConsent } = body;

    const isSubscribed = Boolean(promotionalConsent || productUpdateConsent || newsletterConsent);

    const contact = await prisma.emailContact.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        userId: user.id,
        name: user.name || null,
        isSubscribed,
        promotionalConsent: Boolean(promotionalConsent),
        productUpdateConsent: Boolean(productUpdateConsent),
        newsletterConsent: Boolean(newsletterConsent),
        source: "CUSTOMER_PREFERENCES",
      },
      update: {
        userId: user.id,
        isSubscribed,
        promotionalConsent: Boolean(promotionalConsent),
        productUpdateConsent: Boolean(productUpdateConsent),
        newsletterConsent: Boolean(newsletterConsent),
      },
    });

    if (!promotionalConsent && !productUpdateConsent && !newsletterConsent) {
      await prisma.emailSuppression.upsert({
        where: { email: cleanEmail },
        create: {
          email: cleanEmail,
          reason: "UNSUBSCRIBED",
          source: "USER_CLICK",
          details: "Opted out of all emails from customer preferences",
        },
        update: {},
      });
    } else {
      await prisma.emailSuppression.deleteMany({
        where: { email: cleanEmail },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your email communication preferences have been updated.",
      contact,
    });
  } catch (error: any) {
    console.error("[Preferences POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save preferences" },
      { status: 500 }
    );
  }
}