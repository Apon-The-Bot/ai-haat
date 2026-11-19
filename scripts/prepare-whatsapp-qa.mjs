import {PrismaClient} from "@prisma/client";
import {spawnSync} from "node:child_process";
import {readFileSync,readdirSync,mkdtempSync,writeFileSync,unlinkSync,rmdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const url=new URL(process.env.DATABASE_URL);
if(url.protocol!=="mysql:" || !["localhost","127.0.0.1"].includes(url.hostname) ||
   url.pathname!=="/aihaat_whatsapp_qa" || url.username!=="aihaat_wa_qa" || url.search || url.hash)
  throw new Error("Refusing target outside the dedicated loopback QA schema");
const db=new PrismaClient();
try {
  const [row]=await db.$queryRaw`SELECT DATABASE() AS db, COUNT(*) AS tablesFound FROM information_schema.tables WHERE table_schema=DATABASE()`;
  if(row.db!=="aihaat_whatsapp_qa" || Number(row.tablesFound)!==0) throw new Error("An empty isolated QA schema is required");
} finally {await db.$disconnect();}
const dir=mkdtempSync(join(tmpdir(),"aihaat-qa-schema-"));
const baseline=join(dir,"schema.prisma");
function cli(args,input){
  const result=spawnSync(process.execPath,[require.resolve("prisma"),...args],{
    input,encoding:"utf8",env:process.env,maxBuffer:16*1024*1024,
  });
  if(result.status!==0) throw new Error("QA Prisma step failed ("+args.slice(0,2).join(" ")+"). Inspect the isolated schema before retrying.");
  return result.stdout;
}
try {
  const schema=readFileSync("prisma/schema.prisma","utf8");
  const before=schema.replace(/^model Whatsapp\w+ \{[\s\S]*?^\}\r?\n/gm,"");
  if(before===schema || /^model Whatsapp/m.test(before)) throw new Error("Cannot identify QA baseline");
  writeFileSync(baseline,before,{flag:"wx"});
  // 0_init is a historical SELECT 1 marker. Build only the isolated pre-module schema from its contract.
  const sql=cli(["migrate","diff","--from-empty","--to-schema-datamodel",baseline,"--script"]);
  cli(["db","execute","--schema",baseline,"--stdin"],sql);
  for(const name of readdirSync("prisma/migrations").filter(n=>/^\d+_whatsapp_/.test(n)).sort()){
    cli(["db","execute","--schema",baseline,"--file",join("prisma/migrations",name,"migration.sql")]);
    console.log("QA applied "+name);
  }
  console.log("QA schema prepared. Run test-whatsapp-mysql.mjs with the same QA environment.");
} finally {try{unlinkSync(baseline);}catch(e){if(e.code!=="ENOENT")throw e;}rmdirSync(dir);}
