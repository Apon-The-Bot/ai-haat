import { NextRequest, NextResponse } from "next/server";
import { processPendingNotificationRetries } from "@/lib/notifications";
import { isCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

async function handleRequest(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const authorized = isCronAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing Bearer CRON_SECRET" },
        { status: 401 }
      );
    }

    const summary = await processPendingNotificationRetries(limit);

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Notifications Cron Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
