import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { prisma } from "@/lib/prisma";
import { recipientAddress } from "@/lib/whatsapp/recipient";
import { validateMedia } from "@/lib/whatsapp/media";
import {isZone,zoneOffset} from "@/lib/whatsapp/zones";
import {checkRateLimit} from "@/lib/rate-limit";
import {logAdminAudit} from "@/lib/audit-logger";

export const dynamic = "force-dynamic";
async function guard() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  if (process.env.WHATSAPP_ENABLED !== "true") return NextResponse.json({error:"WhatsApp integration disabled"},{status:503});
  return auth;
}
const invalid = (error:string) => NextResponse.json({error},{status:400});
export async function GET(req:NextRequest) {
  const auth = await guard();
  if (auth instanceof NextResponse) return auth;
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return invalid("Select an account");
  const [contacts,jobs,templates,counts] = await Promise.all([
    prisma.whatsappContact.findMany({where:{accountId},orderBy:{label:"asc"},take:100}),
    prisma.whatsappJob.findMany({where:{contact:{accountId}},orderBy:{due:"desc"},take:100,
      select:{id:true,body:true,due:true,status:true,errorCode:true,retryAt:true,contact:{select:{label:true}}}}),
    prisma.whatsappTemplate.findMany({where:{accountId},orderBy:{name:"asc"},take:100}),
    prisma.whatsappJob.groupBy({by:["status"],where:{contact:{accountId}},_count:{_all:true}}),
  ]);
  return NextResponse.json({contacts,jobs,templates,counts:counts.map(c=>({status:c.status,count:c._count._all}))},
    {headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:NextRequest) {
  const auth = await guard();
  if (auth instanceof NextResponse) return auth;
  if (!req.headers.get("origin") || !isSameOriginMutation(req)) return NextResponse.json({error:"Invalid origin"},{status:403});
  if (!checkRateLimit("wa-messages:"+auth.user.id,30,60000).allowed) return NextResponse.json({error:"Try again in a minute"},{status:429});
  if (Number(req.headers.get("content-length"))>2900000) return invalid("Attachment exceeds 2 MiB");
  const reader=req.body?.getReader();
  if (!reader) return invalid("Missing request");
  const chunks:Uint8Array[]=[];
  let size=0;
  for (;;) {
    const {done,value}=await reader.read();
    if(done) break;
    size+=value.byteLength;
    if(size>2900000){await reader.cancel();return invalid("Attachment exceeds 2 MiB");}
    chunks.push(value);
  }
  let input;
  try {input=JSON.parse(Buffer.concat(chunks).toString());} catch {return invalid("Invalid request");}
  if (!input || typeof input.accountId !== "string") return invalid("Select an account");
  const accountId:string = input.accountId;
  if (input.action === "save-template") {
    if (typeof input.name !== "string" || !input.name.trim() || input.name.length>100 ||
        typeof input.body !== "string" || !input.body.trim() || input.body.length>4096) return invalid("Invalid template");
    const name=input.name.trim();
    await prisma.whatsappTemplate.upsert({where:{accountId_name:{accountId,name}},
      create:{accountId,name,body:input.body},update:{body:input.body}});
  } else if (input.action === "delete-template" && typeof input.id==="string") {
    await prisma.whatsappTemplate.deleteMany({where:{accountId,id:input.id}});
  } else if (input.action === "contact") {
    if (typeof input.address !== "string" || typeof input.label !== "string" || !input.label.trim() ||
      input.label.length > 120 || typeof input.consent !== "boolean") return invalid("Invalid contact");
    let address:string;
    try { address=recipientAddress(input.address); } catch { return invalid("Invalid recipient"); }
    const data={label:input.label.trim(),consent:input.consent,actor:auth.user.id};
    await prisma.whatsappContact.upsert({where:{accountId_address:{accountId,address}},
      create:{...data,accountId,address},update:data});
  } else if (input.action === "send") {
    if (process.env.WHATSAPP_SENDING_ENABLED !== "true") return invalid("Sending is disabled");
    const due = input.due ? new Date(input.due) : new Date();
    const recurrence=input.recurrence ?? "none";
    const timezone=input.timezone ?? "Asia/Dhaka";
    const weekdays=Number(input.weekdays ?? 0);
    if(!isZone(timezone) || !Number.isInteger(weekdays) || weekdays<0 || weekdays>127 ||
        (recurrence==="weekdays" && !weekdays)) return invalid("Choose a timezone and recurrence days");
    const intervalDays=Number(input.intervalDays ?? 1);
    if (!["none","daily","weekly","monthly","custom","weekdays"].includes(recurrence) ||
      !Number.isInteger(intervalDays) || intervalDays<1 || intervalDays>365) return invalid("Invalid recurrence");
    let media;
    try {media=input.media ? validateMedia(input.media) : null;} catch {return invalid("Invalid attachment type or size");}
    if(media?.mime.startsWith("audio/") && input.body) return invalid("Ogg audio does not support captions");
    if (!Number.isFinite(due.getTime()) || typeof input.body !== "string" || (!media && !input.body.trim()) ||
      input.body.length > 4096 || typeof input.contactId !== "string" ||
      typeof input.id !== "string" || !/^[\da-f-]{36}$/i.test(input.id)) return invalid("Invalid message");
    const contact = await prisma.whatsappContact.findFirst({where:{id:input.contactId,accountId,consent:true}});
    if (!contact) return invalid("Recipient consent is required");
    await prisma.whatsappJob.upsert({where:{id:input.id},create:{id:input.id,contact:{connect:{id:contact.id}},
      body:input.body,due,recurrence,intervalDays,timezone,weekdays,anchorDay:new Date(due.getTime()+zoneOffset(timezone)).getUTCDate(),
      ...(media?{media:{create:media}}:{})},update:{}});
  } else if (["edit","duplicate"].includes(input.action) && typeof input.id === "string") {
    const job=await prisma.whatsappJob.findFirst({where:{id:input.id,contact:{accountId}}});
    if (!job) return invalid("Message is unavailable");
    if (input.action==="duplicate") {
      if(job.mediaExpired) return invalid("Attachment retention expired. Compose a new message and upload the file again.");
      if (typeof input.copyId!=="string" || !/^[a-f0-9-]{36}$/i.test(input.copyId)) return invalid("Invalid copy identifier");
      await prisma.whatsappJob.upsert({where:{id:input.copyId},update:{},create:{
        id:input.copyId,contactId:job.contactId,mediaId:job.mediaId,body:job.body,status:"Paused",
        due:job.due,recurrence:job.recurrence,intervalDays:job.intervalDays,anchorDay:job.anchorDay,timezone:job.timezone,weekdays:job.weekdays,
      }});
    } else {
      const due=new Date(input.due);
      if(!input.due || !Number.isFinite(due.getTime()) || typeof input.body!=="string" ||
        input.body.length>4096 || (!job.mediaId && !input.body.trim())) return invalid("Invalid schedule");
      const changed=await prisma.whatsappJob.updateMany({where:{id:job.id,status:{in:["Scheduled","Paused"]}},
        data:{body:input.body,due,anchorDay:new Date(due.getTime()+zoneOffset(job.timezone)).getUTCDate()}});
      if(!changed.count) return invalid("Message has already been processed");
    }
  } else if (["pause","resume","cancel"].includes(input.action) && typeof input.id === "string") {
    const status=input.action==="resume"?"Scheduled":input.action==="pause"?"Paused":"Cancelled";
    const changed=await prisma.whatsappJob.updateMany({where:{id:input.id,contact:{accountId},
      status:{in:input.action==="cancel"?["Scheduled","Paused"]:[input.action==="resume"?"Paused":"Scheduled"]}},data:{status}});
    if (!changed.count) return invalid("Message already changed");
  } else return invalid("Invalid action");
  await logAdminAudit({actorId:auth.user.id,action:"WHATSAPP_"+input.action.toUpperCase(),targetType:"WHATSAPP_ACCOUNT",targetId:accountId});
  return NextResponse.json({ok:true});
}
