import makeSocket, { DisconnectReason,WAMessageStatus } from "@whiskeysockets/baileys";
import pino from "pino";
import {prisma} from "@/lib/prisma";
import {acquire,fenced} from "./ownership";
import {loadAuth} from "./auth-state";
import {dispatch} from "./dispatch";
import {observeGroupReceipts} from "./group-receipts";

// One account per invocation. Socket lifetime is shorter than its 45s DB lease.
export async function runDueBatch() {
  const now=new Date();
  const requested=Number(process.env.WHATSAPP_CRON_SOCKET_MS ?? 25000);
  const budgetMs=Number.isFinite(requested)?Math.max(8000,Math.min(30000,requested)):25000;
  await prisma.whatsappJob.updateMany({where:{status:"Processing",claimUntil:{lte:now},submittedAt:null},
    data:{status:"Scheduled",claimUntil:null,claimToken:null}});
  const eligible={status:"Scheduled",due:{lte:now},OR:[{retryAt:null},{retryAt:{lte:now}}]};
  const job=await prisma.whatsappJob.findFirst({where:{...eligible,contact:{consent:true,account:{
    state:{in:["Ready","Connected","Connecting","Reconnecting"]},keys:{some:{recordId:"creds"}},
    OR:[{leaseEnds:null},{leaseEnds:{lte:now}}],
  }}},orderBy:{due:"asc"},select:{id:true,contact:{select:{accountId:true}}}});
  if (!job) return {outcome:"idle"};
  const accountId=job.contact.accountId;
  const owner=await acquire(accountId,true);
  if (!owner) return {outcome:"busy"};
  let state="Ready";
  let socket:ReturnType<typeof makeSocket>|undefined;
  let timer:ReturnType<typeof setTimeout>|undefined;
  let writes=Promise.resolve();
  let storeFailed=false;
  let connectionMs:number|null=null;
  let accepted=0;
  const enqueue=(fn:()=>Promise<unknown>)=>{
    writes=writes.then(async()=>{await fn();}).catch(()=>{storeFailed=true;socket?.end(new Error("Session write failed"));});
  };
  try {
    const auth=await loadAuth(owner);
    if(!auth.state.creds.me){state="Authentication Expired";return {outcome:"unpaired"};}
    if (!await prisma.whatsappJob.count({where:{...eligible,contact:{accountId,consent:true}}})) return {outcome:"idle"};
    socket=makeSocket({auth:auth.state,logger:pino({level:"silent"}),connectTimeoutMs:8000,
      defaultQueryTimeoutMs:6000,syncFullHistory:false,markOnlineOnConnect:false});
    const client=socket;
    let closed=false;
    const deadline=Date.now()+budgetMs;
    const expired=new Promise<false>(resolve=>{
      timer=setTimeout(()=>{closed=true;resolve(false);client.end(new Error("Cron time budget"));},budgetMs);
    });
    client.ev.on("creds.update",()=>enqueue(auth.save));
    observeGroupReceipts(owner,client,enqueue);
    client.ev.on("messages.update",events=>enqueue(async()=>{
      for(const {key,update} of events){
        if(!key.fromMe || !key.id || !key.remoteJid || key.remoteJid.endsWith("@g.us")) continue;
        const read=update.status===WAMessageStatus.READ || update.status===WAMessageStatus.PLAYED;
        if(!read && update.status!==WAMessageStatus.DELIVERY_ACK) continue;
        await fenced(owner,tx=>tx.whatsappJob.updateMany({where:{contact:{accountId},destination:key.remoteJid!,
          messageId:key.id!,status:{in:read?["Unknown","Sent","Delivered"]:["Unknown","Sent"]}},data:{status:read?"Read":"Delivered"}}));
      }
    }));
    const opened=new Promise<boolean>(resolve=>client.ev.on("connection.update",event=>{
      if(event.connection==="open") resolve(true);
      if(event.connection==="close" || event.qr){
        closed=true;
        const code=(event.lastDisconnect?.error as {output?:{statusCode?:number}})?.output?.statusCode;
        if(code===DisconnectReason.loggedOut || event.qr) state="Authentication Expired";
        resolve(false);
      }
    }));
    if(!await Promise.race([opened,expired])) {
      await fenced(owner,tx=>tx.whatsappJob.updateMany({where:{id:job.id,status:"Scheduled"},
        data:{retryAt:new Date(Date.now()+120000),errorCode:"CONNECTION_UNAVAILABLE"}}));
      return {outcome:"connection-unavailable"};
    }
    connectionMs=Date.now()-now.getTime();
    for(let i=0;i<3 && !closed && !storeFailed && Date.now()<deadline-7000;i++) {
      if(!await Promise.race([dispatch(owner,client,()=>!closed && Date.now()<deadline),expired])) break;
      accepted++;
    }
    return {outcome:storeFailed?"storage-error":"processed",accepted,connectionMs};
  } finally {
    if(timer) clearTimeout(timer);
    socket?.end(undefined);
    await writes;
    await prisma.$transaction(async tx=>{
      await tx.whatsappAccount.updateMany({where:{id:accountId,leaseId:owner.token,state:"Connecting"},
        data:{state,leaseId:null,leaseEnds:null}});
      await tx.adminAuditLog.create({data:{action:"WHATSAPP_CRON_FINISHED",targetId:accountId,targetType:"WHATSAPP_ACCOUNT",
        details:JSON.stringify({elapsedMs:Date.now()-now.getTime(),connectionMs,accepted,sessionState:state,storageFailed:storeFailed})}});
    });
  }
}
