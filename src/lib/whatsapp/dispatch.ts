import type { WASocket } from "@whiskeysockets/baileys";
import { generateMessageIDV2 } from "@whiskeysockets/baileys";
import { prisma } from "@/lib/prisma";
import { fenced, type Owner } from "./ownership";
import { nextOccurrence } from "./recurrence";
import { randomUUID } from "node:crypto";
import { messageContent } from "./media";
import { audienceSnapshot } from "./group-receipts";

async function destination(socket: WASocket, address:string) {
  let jid = address;
  let members:string[]=[];
  if (address.startsWith("https://")) {
    const metadata = await socket.groupGetInviteInfo(address.split("/").pop()!);
    jid = metadata.id;
  }
  if (jid.endsWith("@g.us")) {
    const group = await socket.groupMetadata(jid);
    const user = socket.user;
    const clean = (id?:string) => id?.replace(/:\d+@/,"@");
    const own = group.participants.find(p=>user && [clean(user.id),clean(user.lid)].includes(clean(p.id)));
    if (!own || (group.announce && !own.admin)) throw new Error("Group permission denied");
    members=group.participants.filter(p=>p!==own).map(p=>p.id);
  } else if (jid.endsWith("@s.whatsapp.net")) {
    const [record] = await socket.onWhatsApp(jid) ?? [];
    if (!record?.exists) throw new Error("Unknown recipient");
    jid = record.jid;
  }
  return {jid,members};
}

export async function dispatch(owner:Owner,socket:WASocket,withinBudget=()=>true) {
  if (process.env.WHATSAPP_ENABLED !== "true" || process.env.WHATSAPP_SENDING_ENABLED !== "true") return;
  const now=new Date();
  const job = await prisma.whatsappJob.findFirst({where:{status:"Scheduled",due:{lte:now},
    OR:[{retryAt:null},{retryAt:{lte:now}}],
    contact:{accountId:owner.accountId,consent:true}},include:{contact:true},orderBy:{due:"asc"}});
  if (!job) return;
  const claimToken=randomUUID();
  const locked=await fenced(owner,tx=>tx.whatsappJob.updateMany({where:{id:job.id,status:"Scheduled",
    body:job.body,due:job.due,contact:{accountId:owner.accountId,consent:true}},
    data:{status:"Processing",claimToken,claimUntil:new Date(Date.now()+45000)}}));
  if(!locked.count) return;
  const processing={id:job.id,status:"Processing",claimToken};
  const release={claimToken:null,claimUntil:null};
  let jid:string;
  let members:string[];
  try { ({jid,members} = await destination(socket,job.contact.address)); }
  catch(error) {
    const permanent=error instanceof Error && ["Unknown recipient","Group permission denied"].includes(error.message);
    const attempts=job.attempts+1;
    const retry=!permanent && attempts<4;
    await fenced(owner,tx=>tx.whatsappJob.updateMany({where:{...processing,attempts:job.attempts},data:{...release,
      attempts,status:retry?"Scheduled":"Failed",retryAt:retry?new Date(Date.now()+15000*2**attempts):null,
      errorCode:permanent?"RECIPIENT_UNAVAILABLE":"RECIPIENT_LOOKUP_FAILED",
    }}));
    return;
  }
  // Commit uncertainty before crossing the network boundary. A crash leaves an inspectable, non-retryable job.
  if(!withinBudget()) return;
  const media=job.mediaId ? await prisma.whatsappMedia.findUniqueOrThrow({where:{id:job.mediaId}}) : null;
  const messageId = generateMessageIDV2(socket.user?.id);
  const claimed = await fenced(owner,async tx=>{
    const since=new Date(Date.now()-3600000);
    const count=(contactOnly:boolean)=>tx.whatsappJob.count({where:{submittedAt:{gte:since},
      ...(contactOnly?{destination:jid}:{}),contact:{accountId:owner.accountId}}});
    if(await count(false)>=60 || await count(true)>=6) {
      await tx.whatsappJob.updateMany({where:processing,data:{...release,status:"Scheduled",retryAt:new Date(Date.now()+60000),errorCode:"QUOTA_WAIT"}});
      return {count:0};
    }
    return tx.whatsappJob.updateMany({
    where:{...processing,claimUntil:{gt:new Date()},contact:{consent:true,accountId:owner.accountId}},
    data:{...release,status:"Unknown",submittedAt:new Date(),messageId,destination:jid,errorCode:null,retryAt:null,
      ...(members.length?{groupReceipts:audienceSnapshot(messageId,members)}:{})},
    });
  });
  if (!claimed.count || !withinBudget()) return;
  const result = await socket.sendMessage(jid,messageContent(job.body,media),{messageId,mediaUploadTimeoutMs:6500});
  if (result?.key.id !== messageId) return false;
  await fenced(owner,async tx=>{
    await tx.whatsappJob.updateMany({where:{id:job.id,status:"Unknown"},data:{status:"Sent",messageId}});
    const due=nextOccurrence(job.due,job.recurrence,job.intervalDays,new Date(),job.anchorDay,job.timezone,job.weekdays);
    if (due) await tx.whatsappJob.create({data:{id:randomUUID(),contactId:job.contactId,
      body:job.body,mediaId:job.mediaId,recurrence:job.recurrence,intervalDays:job.intervalDays,anchorDay:job.anchorDay,
      timezone:job.timezone,weekdays:job.weekdays,due}});
  });
  return true;
}
