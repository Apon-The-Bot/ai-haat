const {readFileSync}=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
const {test}=require("node:test");
const assert=require("node:assert/strict");

// Load the production worker with an in-memory DB and socket. No Prisma client or network is opened.
function load(name, dependencies={}) {
  const file=path.join(__dirname,"../src/lib/whatsapp",name+".ts");
  const code=ts.transpileModule(readFileSync(file,"utf8"),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
  }).outputText;
  const module={exports:{}};
  Function("require","module","exports",code)(id=>Object.hasOwn(dependencies,id)?dependencies[id]:require(id),module,module.exports);
  return module.exports;
}
const media=load("media");
const recurrence=load("recurrence",{"./zones":load("zones")});
test("weekday schedule keeps local calendar day across UTC midnight",()=>{
  const due=new Date("2026-11-19T19:00Z");
  const next=recurrence.nextOccurrence(due,"weekdays",1,due,null,"Asia/Dhaka",1<<1);
  assert.equal(next.toISOString(),"2026-11-22T19:00:00.000Z");
});
test("monthly schedule restores its anchor after February",()=>{
  const due=new Date("2026-02-28T09:00Z");
  assert.equal(recurrence.nextOccurrence(due,"monthly",1,due,31,"UTC").toISOString(),"2026-03-31T09:00:00.000Z");
});
test("encrypted Signal records reject another account or record identifier",()=>{
  const {sealSession,openSession}=load("session-cipher");
  process.env.WHATSAPP_SESSION_KEY=require("node:crypto").randomBytes(32).toString("hex");
  const payload=sealSession("a","key",Buffer.from("fixture"));
  assert.equal(openSession("a","key",payload).toString(),"fixture");
  assert.throws(()=>openSession("b","key",payload));assert.throws(()=>openSession("a","other",payload));
});
test("media validation rejects unknown headers and oversized payloads",()=>{
  assert.throws(()=>media.validateMedia({filename:"x.png",base64:"dGV4dA=="}));
  assert.throws(()=>media.validateMedia({filename:"x",base64:"A".repeat(3000000)}));
});
function fixture(fail=false,recent=0) {
  const job={id:"j",contactId:"c",status:"Scheduled",due:new Date(),recurrence:"none",body:"fixture",
    contact:{accountId:"a",address:"8801700000000@s.whatsapp.net",consent:true}};
  let calls=0;
  const prisma={whatsappJob:{
    count:async()=>recent,
    findFirst:async()=>job.status==="Scheduled" && job.contact.consent?{...job}:null,
    updateMany:async({where,data})=>{
      if(where.status!==job.status || (where.contact?.consent && !job.contact.consent)) return {count:0};
      Object.assign(job,data);return {count:1};
    },
  }};
  const socket={onWhatsApp:async jid=>[{exists:true,jid}],sendMessage:async(jid,content,{messageId})=>{
    calls++;if(fail) throw new Error("Socket closed");return {key:{id:messageId}};
  }};
  const {dispatch}=load("dispatch",{"@/lib/prisma":{prisma},"./ownership":{fenced:(_,fn)=>fn(prisma)},
    "./media":media,"./group-receipts":load("group-receipts",{"./ownership":{}}),"./recurrence":load("recurrence",{"./zones":load("zones")})});
  return {job,run:()=>dispatch({accountId:"a",token:"fixture"},socket),calls:()=>calls};
}
process.env.WHATSAPP_ENABLED="true";
process.env.WHATSAPP_SENDING_ENABLED="true";
test("two mocked workers submit once",async()=>{
  const f=fixture();await Promise.all([f.run(),f.run()]);assert.equal(f.calls(),1);assert.equal(f.job.status,"Sent");
});
test("ambiguous socket outcome stays Unknown on next tick",async()=>{
  const f=fixture(true);await assert.rejects(f.run());await f.run();assert.equal(f.calls(),1);assert.equal(f.job.status,"Unknown");
});
test("opted-out recipient gets no submission",async()=>{
  const f=fixture();f.job.contact.consent=false;await f.run();assert.equal(f.calls(),0);
});
test("recorded hourly submissions defer a recipient before invoking the socket",async()=>{
  const f=fixture(false,6);await f.run();assert.equal(f.calls(),0);assert.equal(f.job.status,"Scheduled");
  assert.equal(f.job.errorCode,"QUOTA_WAIT");
});

test("group evidence advances only after every original member acknowledges",async()=>{
  const ev=new (require("node:events").EventEmitter)();
  const job={id:"j",status:"Sent"};
  const tx={whatsappJob:{findFirst:async()=>job,update:async({data})=>Object.assign(job,data)}};
  const group=load("group-receipts",{"./ownership":{fenced:(_,fn)=>fn(tx)}});
  job.groupReceipts=group.audienceSnapshot("m",["1@lid","2@lid"]);
  let writes;
  group.observeGroupReceipts({accountId:"a"},{ev},fn=>{writes=fn();});
  async function receipt(userJid,field){
    ev.emit("message-receipt.update",[{key:{fromMe:true,id:"m",remoteJid:"fixture@g.us"},receipt:{userJid,[field]:1}}]);await writes;
  }
  await receipt("1@lid","readTimestamp");assert.equal(job.status,"Sent");
  await receipt("3@lid","readTimestamp");assert.equal(job.status,"Sent");
  await receipt("2@lid","receiptTimestamp");assert.equal(job.status,"Delivered");
  await receipt("2@lid","readTimestamp");assert.equal(job.status,"Read");
});

function cronFixture(eligible){
  let sockets=0,closes=0,submissions=0;
  const prisma={whatsappJob:{updateMany:async()=>({count:0}),findFirst:async()=>eligible?{contact:{accountId:"a"}}:null,count:async()=>1},
    $transaction:async fn=>fn({whatsappAccount:{updateMany:async()=>({count:1})},adminAuditLog:{create:async()=>({})}})};
  function makeSocket(){
    sockets++;
    const ev=new (require("node:events").EventEmitter)();
    setImmediate(()=>ev.emit("connection.update",{connection:"open"}));
    return {ev,end(){closes++;ev.emit("connection.update",{connection:"close"});}};
  }
  const {runDueBatch}=load("cron",{
    "@/lib/prisma":{prisma},"./ownership":{acquire:async()=>({accountId:"a",token:"mock"})},
    "./dispatch":{dispatch:async()=>{submissions++;return true;}},
    "./auth-state":{loadAuth:async()=>({state:{creds:{me:{id:"fixture"}}},save:async()=>{}})},
    "./group-receipts":{observeGroupReceipts(){}},
    "@whiskeysockets/baileys":{default:makeSocket,DisconnectReason:{loggedOut:401}},
    pino:{default:()=>({})},
  });
  return {runDueBatch,stats:()=>[sockets,closes,submissions]};
}
test("idle cron invocation never creates a socket",async()=>{
  const c=cronFixture(false);assert.equal((await c.runDueBatch()).outcome,"idle");assert.deepEqual(c.stats(),[0,0,0]);
});
test("two independent cron invocations close sockets and cap each batch",async()=>{
  const c=cronFixture(true);await c.runDueBatch();await c.runDueBatch();assert.deepEqual(c.stats(),[2,2,6]);
});
