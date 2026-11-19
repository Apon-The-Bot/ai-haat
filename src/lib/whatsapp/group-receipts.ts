import {createHash} from "node:crypto";
import type { MessageUserReceiptUpdate, WASocket } from "@whiskeysockets/baileys";
import {fenced,type Owner} from "./ownership";

function memberKey(messageId:string,id:string) {
  return createHash("sha256").update(messageId+"|"+id.replace(/:\d+@/,"@")).digest("hex");
}
export function audienceSnapshot(messageId:string,ids:string[]) {
  return Object.fromEntries(ids.map(id=>[memberKey(messageId,id),0]));
}
export function observeGroupReceipts(owner:Owner,socket:WASocket,enqueue:(fn:()=>Promise<void>)=>void){
  socket.ev.on("message-receipt.update",(events:MessageUserReceiptUpdate[])=>enqueue(async()=>{
    for(const {key,receipt} of events){
      const messageId=key.id,destination=key.remoteJid;
      if(!key.fromMe || !messageId || !destination?.endsWith("@g.us") || !receipt.userJid) continue;
      const level=Number(receipt.readTimestamp)>0 || Number(receipt.playedTimestamp)>0 ? 2 : Number(receipt.receiptTimestamp)>0 ? 1 : 0;
      if(!level) continue;
      const member=memberKey(messageId,receipt.userJid);
      await fenced(owner,async tx=>{
        const job=await tx.whatsappJob.findFirst({where:{messageId,destination,contact:{accountId:owner.accountId}},
          select:{id:true,groupReceipts:true}});
        const snapshot=job?.groupReceipts;
        if(!job || !snapshot || typeof snapshot!=="object" || Array.isArray(snapshot) || !Object.hasOwn(snapshot,member)) return;
        const previous=snapshot[member];
        if(typeof previous!=="number" || previous>=level) return;
        const next={...snapshot,[member]:level} as Record<string,number>;
        const minimum=Math.min(...Object.values(next));
        await tx.whatsappJob.update({where:{id:job.id},data:{groupReceipts:next,
          ...(minimum>=2?{status:"Read"}:minimum>=1?{status:"Delivered"}:{})}});
      });
    }
  }));
}
