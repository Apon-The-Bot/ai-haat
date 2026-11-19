import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import {checkRateLimit} from "@/lib/rate-limit";
import {logAdminAudit} from "@/lib/audit-logger";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { openSession } from "@/lib/whatsapp/session-cipher";
import { isSameOriginMutation } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";
const json = (body:unknown, status=200) => NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  if (process.env.WHATSAPP_ENABLED !== "true") return json({error:"WhatsApp integration is disabled"},503);
  const rows = await prisma.whatsappAccount.findMany({orderBy:{createdAt:"desc"},take:100,
    include:{keys:{where:{recordId:{in:["qr","pairing"]}}}}});
  const accounts = await Promise.all(rows.map(async row => {
    const active = row.leaseEnds && row.leaseEnds.getTime() > Date.now();
    const read=(id:string)=>{
      const key=row.keys.find(k=>k.recordId===id);
      return key && active && row.state==="Waiting for QR Scan" ? JSON.parse(openSession(row.id,id,key.payload).toString()) : null;
    };
    const qr=read("qr"), pairing=read("pairing");
    return {id:row.id,label:row.label,state:row.leaseId && !active ? "Disconnected" : row.state,
      qr:qr?.expires > Date.now() ? await QRCode.toDataURL(qr.value) : null,
      pairing:pairing?.expires>Date.now()?pairing.value:null};
  }));
  return json({accounts});
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  if (!req.headers.get("origin") || !isSameOriginMutation(req)) return json({error:"Invalid origin"},403);
  if (process.env.WHATSAPP_ENABLED !== "true") return json({error:"WhatsApp integration is disabled"},503);
  const body = await req.json().catch(() => null);
  if (!checkRateLimit("wa-accounts:"+auth.user.id,20,60000).allowed) return json({error:"Try again in a minute"},429);
  if (body?.action === "create" && typeof body.label === "string" && body.label.trim() && body.label.length <= 120) {
    const row=await prisma.whatsappAccount.create({data:{label:body.label.trim()}});
    await logAdminAudit({actorId:auth.user.id,action:"WHATSAPP_CREATE",targetType:"WHATSAPP_ACCOUNT",targetId:row.id});
    return json({ok:true},201);
  }
  if (typeof body?.id !== "string") return json({error:"Invalid account"},400);
  if (body.action === "connect") {
    const {connect} = await import("@/lib/whatsapp/connect");
    if(body.phone!==undefined && (typeof body.phone!=="string" || !/^[1-9]\d{7,14}$/.test(body.phone))) return json({error:"Enter the international number with digits only"},400);
    await connect(body.id,0,body.phone);
  } else if (body.action === "sync-groups") {
    const changed=await prisma.whatsappAccount.updateMany({where:{id:body.id,state:"Connected",leaseEnds:{gt:new Date()}},
      data:{state:"Syncing groups"}});
    if(!changed.count) return json({error:"Connect the account first"},409);
  } else if (body.action === "disconnect" || body.action === "logout") {
    const state=body.action==="logout"?"Logout requested":"Disconnect requested";
    if(body.action==="disconnect" && (await prisma.whatsappAccount.updateMany({where:{id:body.id,
      state:"Ready",leaseId:null},data:{state:"Disconnected"}})).count) {
      await logAdminAudit({actorId:auth.user.id,action:"WHATSAPP_DISCONNECT",targetType:"WHATSAPP_ACCOUNT",targetId:body.id});
      return json({ok:true});
    }
    const changed=await prisma.whatsappAccount.updateMany({where:{id:body.id,state:{in:["Connected","Waiting for QR Scan","Syncing groups"]},leaseEnds:{gt:new Date()}},data:{state}});
    if(!changed.count) return json({error:"Connect this account first"},409);
  } else if (body.action === "remove") {
    const changed=await prisma.whatsappAccount.deleteMany({where:{id:body.id,leaseId:null,
      keys:{none:{}},contacts:{none:{jobs:{some:{}}}}}});
    if(!changed.count) return json({error:"Log out first. Accounts with message history are retained."},409);
  } else return json({error:"Invalid action"},400);
  await logAdminAudit({actorId:auth.user.id,action:"WHATSAPP_"+body.action.toUpperCase(),targetType:"WHATSAPP_ACCOUNT",targetId:body.id});
  return json({ok:true});
}
