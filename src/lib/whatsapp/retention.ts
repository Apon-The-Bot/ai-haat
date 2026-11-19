import {prisma} from "@/lib/prisma";

export async function cleanupMedia(){
  const cutoff=new Date(Date.now()-30*86400000);
  const old={status:{in:["Sent","Delivered","Read","Cancelled","Failed","Unknown"]},due:{lt:cutoff},
    OR:[{submittedAt:null},{submittedAt:{lt:cutoff}}]};
  const media=await prisma.whatsappMedia.findMany({where:{jobs:{every:old}},select:{id:true},take:10});
  for(const {id} of media) await prisma.$transaction(async tx=>{
    await tx.whatsappJob.updateMany({where:{mediaId:id,...old},data:{mediaId:null,mediaExpired:true}});
    await tx.whatsappMedia.deleteMany({where:{id,jobs:{none:{}}}});
  });
}
