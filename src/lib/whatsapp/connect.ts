import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import { prisma } from "@/lib/prisma";
import { acquire, fenced, renew } from "./ownership";
import { loadAuth, sessionRecords } from "./auth-state";
import { WAMessageStatus } from "@whiskeysockets/baileys";
import {observeGroupReceipts} from "./group-receipts";

export async function connect(accountId: string, attempt = 0, pairingPhone?:string) {
  if (process.env.WHATSAPP_ENABLED !== "true") throw new Error("WhatsApp disabled");
  const owner = await acquire(accountId);
  if (!owner) return;
  try {
    const auth = await loadAuth(owner);
    const records = sessionRecords(owner);
    const socket = makeWASocket({ auth: auth.state, logger: pino({level:"silent"}),
      markOnlineOnConnect: false, syncFullHistory: false, printQRInTerminal: false });
    let ended = false;
    let online = false;
    let timedOut=false;
    const lifetime=setTimeout(()=>{timedOut=true;socket.end(new Error("Interactive window ended"));},75000);
    lifetime.unref();
    let stopping = false;
    let requestedPairing=false;
    let syncing=false;
    let work = Promise.resolve();
    const heartbeat = setInterval(() => {
      void renew(owner).then(async valid => {
        if (!valid || process.env.WHATSAPP_ENABLED !== "true") socket.end(new Error("Session stopped"));
        else if (!stopping) {
          const row=await prisma.whatsappAccount.findUnique({where:{id:accountId},select:{state:true}});
          if(row?.state==="Syncing groups" && online) {
            if(syncing) return;
            syncing=true;
            try {
              const groups=Object.values(await socket.groupFetchAllParticipating());
              for (let i=0;i<groups.length;i+=20) {
                await fenced(owner,async tx=>{
                  for (const group of groups.slice(i,i+20)) {
                    const address=group.id,label=group.subject.slice(0,120);
                    await tx.whatsappContact.upsert({where:{accountId_address:{accountId,address}},
                      create:{accountId,address,label,actor:"group-sync",consent:false},update:{label}});
                  }
                });
              }
            } finally {
              syncing=false;
              await fenced(owner,tx=>tx.whatsappAccount.updateMany({where:{id:accountId,state:"Syncing groups"},data:{state:"Connected"}}));
            }
            return;
          }
          if (row?.state==="Disconnect requested" || row?.state==="Logout requested") {
            stopping=true;
            if(row.state==="Logout requested") await socket.logout();
            else socket.end(new Error("Admin disconnected"));
            return;
          }
        }
      }).catch(() => socket.end(new Error("Lease unavailable")));
    }, 12000);
    heartbeat.unref();
    const enqueue = (action: () => Promise<void>) => {
      work = work.then(action).catch(() => { socket.end(new Error("Session storage unavailable")); });
    };
    socket.ev.on("creds.update", () => enqueue(auth.save));
    observeGroupReceipts(owner,socket,enqueue);
    socket.ev.on("messages.update", changes => enqueue(async () => {
      for (const {key,update} of changes) {
        if (!key.fromMe || !key.id || !key.remoteJid || key.remoteJid.endsWith("@g.us")) continue;
        const status = update.status === WAMessageStatus.DELIVERY_ACK ? "Delivered" :
          update.status === WAMessageStatus.READ || update.status === WAMessageStatus.PLAYED ? "Read" : null;
        if (!status) continue;
        await fenced(owner,tx=>tx.whatsappJob.updateMany({where:{messageId:key.id!,destination:key.remoteJid!,
          contact:{accountId},status:{in:status==="Read"?["Unknown","Sent","Delivered"]:["Unknown","Sent"]}},data:{status}}));
      }
    }));
    socket.ev.on("connection.update", update => enqueue(async () => {
      if (ended) return;
      if (update.connection === "close") {
        ended = true;
        clearInterval(heartbeat);
        clearTimeout(lifetime);
        const code = (update.lastDisconnect?.error as {output?:{statusCode?:number}})?.output?.statusCode;
        const expired = code === DisconnectReason.loggedOut;
        const retry = !expired && !stopping && !timedOut && attempt < 2;
        await records.write([["qr", null],["pairing",null]]);
        await fenced(owner, async tx => {
          if (expired) await tx.whatsappSessionRecord.deleteMany({where:{accountId}});
          await tx.whatsappAccount.update({ where:{id:accountId}, data:{
            state: expired ? "Authentication Expired" : stopping ? "Disconnected" : timedOut && online ? "Ready" : retry ? "Reconnecting" : "Connection Failed",
            leaseEnds:null, leaseId:null,
          }});
        });
        if (retry) setTimeout(() => {
          void prisma.whatsappAccount.findFirst({where:{id:accountId,state:"Reconnecting"}})
            .then(row => row && connect(accountId, attempt+1)).catch(() => {});
        }, 1000 * 2 ** attempt).unref();
        return;
      }
      if (update.qr || update.connection === "open") {
        const connected = update.connection === "open";
        online = connected;
        await records.write([["qr", connected ? null : {value:update.qr, expires:Date.now()+20000}]]);
        if(connected) await records.write([["pairing",null]]);
        if(update.qr && pairingPhone && !auth.state.creds.registered && !requestedPairing) {
          requestedPairing=true;
          const value=await socket.requestPairingCode(pairingPhone);
          await records.write([["pairing",{value,expires:Date.now()+60000}]]);
        }
        await fenced(owner, tx => tx.whatsappAccount.update({where:{id:accountId},
          data:{state:connected ? "Connected" : "Waiting for QR Scan"}}));
      }
    }));
  } catch (error) {
    await prisma.whatsappAccount.updateMany({where:{id:accountId,leaseId:owner.token},
      data:{state:"Connection Failed",leaseEnds:null,leaseId:null}});
    throw error;
  }
}
