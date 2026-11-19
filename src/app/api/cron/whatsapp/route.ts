import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { cleanupMedia } from "@/lib/whatsapp/retention";
export async function POST(req:NextRequest) {
  if (!isCronAuthorized(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  if (process.env.WHATSAPP_ENABLED !== "true") return NextResponse.json({enabled:false});
  await cleanupMedia();
  if(process.env.WHATSAPP_SENDING_ENABLED!=="true") return NextResponse.json({outcome:"sending-disabled"});
  const {runDueBatch}=await import("@/lib/whatsapp/cron");
  return NextResponse.json(await runDueBatch());
}
