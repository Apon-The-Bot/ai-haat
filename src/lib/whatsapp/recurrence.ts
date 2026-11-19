const day = 86400000;
import {zoneOffset} from "./zones";
export function nextOccurrence(due:Date, kind:string, interval:number, now:Date, anchor?:number|null,zone="Asia/Dhaka",weekdays=0) {
  if (kind === "none") return null;
  const offset=zoneOffset(zone);
  if(kind==="weekdays") {
    if(!Number.isInteger(weekdays) || weekdays<1 || weekdays>127) throw new Error("Select weekdays");
    const next=new Date(due.getTime()+day*Math.max(1,1+Math.floor((now.getTime()-due.getTime())/day)));
    while(!(weekdays & (1 << new Date(next.getTime()+offset).getUTCDay()))) next.setUTCDate(next.getUTCDate()+1);
    return next;
  }
  if (kind === "monthly") {
    const local = new Date(due.getTime()+offset);
    const targetDay = anchor ?? local.getUTCDate();
    do {
      local.setUTCDate(1);
      local.setUTCMonth(local.getUTCMonth()+1);
      const lastDay = new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth()+1,0)).getUTCDate();
      local.setUTCDate(Math.min(targetDay,lastDay));
    } while(local.getTime()-offset <= now.getTime());
    return new Date(local.getTime()-offset);
  }
  const days = kind==="daily"?1:kind==="weekly"?7:kind==="custom"?interval:0;
  if (!Number.isInteger(days) || days<1 || days>365) throw new Error("Invalid recurrence");
  const step = days*day;
  return new Date(due.getTime()+step*Math.max(1,1+Math.floor((now.getTime()-due.getTime())/step)));
}
