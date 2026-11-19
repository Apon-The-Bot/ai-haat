import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Run from the actual host CLI with --env-file. Never print headers, URLs with secrets or response bodies.
if(process.argv[2]==="--print-command"){
  const envPath=process.argv[3];
  if(process.platform!=="linux" || !envPath || !existsSync(envPath)) throw new Error("Run on hosting with the readable deployment env-file path");
  const paths=[process.execPath,realpathSync(envPath),fileURLToPath(import.meta.url)];
  if(paths.some(p=>!/^\/[a-zA-Z0-9_./-]+$/.test(p))) throw new Error("Unsupported cron path");
  const command=paths[0]+" --env-file="+paths[1]+" "+paths[2];
  if(command.length>255) throw new Error("Cron command exceeds Hostinger length limit");
  console.log(command);
} else {
  const origin=new URL(process.env.NEXTAUTH_URL);
  if(origin.protocol!=="https:" || origin.username || origin.password || !process.env.CRON_SECRET) throw new Error("Configure HTTPS application origin and cron secret");
  const response=await fetch(new URL("/api/cron/whatsapp",origin),{method:"POST",redirect:"error",
    headers:{Authorization:"Bearer "+process.env.CRON_SECRET},signal:AbortSignal.timeout(95000)});
  if(!response.ok) throw new Error("Cron endpoint returned "+response.status);
  const report=await response.json();
  console.log("WhatsApp cron:",report.outcome ?? "disabled");
}
