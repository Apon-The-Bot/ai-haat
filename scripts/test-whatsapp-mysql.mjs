// Run with node --env-file=.env.whatsapp-qa.local after the isolated schema is prepared.
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {PrismaClient} from "@prisma/client";

const url=new URL(process.env.DATABASE_URL);
if(url.protocol!=="mysql:" || !["127.0.0.1","localhost"].includes(url.hostname) ||
   url.pathname!=="/aihaat_whatsapp_qa" || url.username!=="aihaat_wa_qa") {
  throw new Error("Requires the dedicated loopback QA database and restricted QA user");
}
const db=new PrismaClient(), other=new PrismaClient();
const id=randomUUID(), jobId=randomUUID();
let created=false;
try {
  const [target]=await db.$queryRaw`SELECT DATABASE() AS db`;
  assert.equal(target.db,"aihaat_whatsapp_qa");
  await db.whatsappAccount.create({data:{id,label:"QA lease fixture",state:"Ready"}});
  created=true;
  const claim=(client,token)=>client.$executeRaw`UPDATE whatsapp_accounts SET leaseId=${token},
    leaseEnds=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 45 SECOND) WHERE id=${id}
    AND (leaseEnds IS NULL OR leaseEnds<=UTC_TIMESTAMP(3))`;
  const wins=await Promise.all([claim(db,"one"),claim(other,"two")]);
  assert.deepEqual(wins.sort(),[0,1]);
  await db.whatsappAccount.update({where:{id},data:{leaseEnds:new Date(0)}});
  assert.equal(await claim(other,"successor"),1);
  const contact=await db.whatsappContact.create({data:{accountId:id,label:"QA",address:"fixture",actor:"QA",consent:true}});
  await db.whatsappJob.create({data:{id:jobId,contactId:contact.id,due:new Date(),body:"fixture"}});
  const reserve=client=>client.whatsappJob.updateMany({where:{id:jobId,status:"Scheduled"},data:{status:"Processing"}});
  assert.deepEqual((await Promise.all([reserve(db),reserve(other)])).map(r=>r.count).sort(),[0,1]);
  await assert.rejects(db.$transaction(async tx=>{
    await tx.whatsappJob.update({where:{id:jobId},data:{status:"Unknown"}});
    throw new Error("Deliberate QA rollback");
  }),/Deliberate QA rollback/);
  assert.equal((await other.whatsappJob.findUniqueOrThrow({where:{id:jobId}})).status,"Processing");
  console.log("QA MySQL passed account leases, expired lease recovery, job contention and rollback");
} finally {
  try {
    if(created) await db.$transaction([
      db.whatsappJob.deleteMany({where:{id:jobId,contact:{accountId:id}}}),
      db.whatsappAccount.delete({where:{id}}),
    ]);
  } finally {await Promise.all([db.$disconnect(),other.$disconnect()]);}
}
