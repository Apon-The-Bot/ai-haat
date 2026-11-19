"use client";
import {useState} from "react";

export type Job={id:string;body:string;due:string;status:string;errorCode?:string;retryAt?:string;contact:{label:string}};
type Props={jobs:Job[];pending:boolean;refresh:()=>void;act:(action:string,id:string,extra?:Record<string,string>)=>void};
function csvCell(value:string) {
  const safe=/^[\s]*[=+@-]|^[\t\r\n]/.test(value)?"'"+value:value;
  return '"'+safe.replaceAll('"','""')+'"';
}
export function History({jobs,pending,refresh,act}:Props) {
  const [query,setQuery]=useState("");
  const [status,setStatus]=useState("");
  const [from,setFrom]=useState("");
  const [to,setTo]=useState("");
  const filtered=jobs.filter(job=>{
    const date=new Date(Date.parse(job.due)+21600000).toISOString().slice(0,10);
    return (!status || job.status===status) && (!from || date>=from) && (!to || date<=to) &&
      [job.contact.label,job.body].some(value=>value.toLowerCase().includes(query.toLowerCase()));
  });
  function download(){
    const rows=[["Recipient","Scheduled UTC","Status","Message"],...filtered.map(j=>[j.contact.label,j.due,j.status,j.body])];
    const url=URL.createObjectURL(new Blob(["\uFEFF",rows.map(r=>r.map(csvCell).join(",")).join("\r\n")],
      {type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="whatsapp-history.csv";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section className="space-y-3"><h2 className="text-xl font-semibold">Message History</h2>
    <div className="flex flex-wrap gap-3"><input aria-label="Search recent messages" placeholder="Search latest 100 messages"
      value={query} onChange={e=>setQuery(e.target.value)}/>
      <select aria-label="Message status" value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="">All statuses</option>{Array.from(new Set(jobs.map(j=>j.status))).map(s=><option key={s}>{s}</option>)}</select>
      <label>From <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
      <label>Through <input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
      <button onClick={refresh}>Refresh</button><button disabled={!filtered.length} onClick={download}>Export filtered CSV</button>
    </div>
    {!filtered.length && <p>No matching recent messages.</p>}
    {filtered.map(j=><article key={j.id} className="rounded border p-3">
      <p>{j.contact.label} · {j.status} · {new Date(j.due).toLocaleString("en-GB",{timeZone:"Asia/Dhaka"})} Dhaka</p>
      <p className="whitespace-pre-wrap break-words">{j.body}</p>
      {j.errorCode && <p>{j.errorCode==="QUOTA_WAIT"?"Hourly sending limit reached.":j.errorCode==="RECIPIENT_UNAVAILABLE"?"Recipient unavailable or group permission denied.":"Recipient lookup failed."}
        {j.retryAt && " Next attempt "+new Date(j.retryAt).toLocaleString("en-GB",{timeZone:"Asia/Dhaka"})+" Dhaka."}</p>}
      <button disabled={pending} onClick={()=>act("duplicate",j.id,{copyId:crypto.randomUUID()})}>Duplicate as paused</button>
      {["Scheduled","Paused"].includes(j.status) && <details><summary>Edit schedule</summary>
        <form onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);
          act("edit",j.id,{body:String(data.get("body")),due:String(data.get("due"))+":00+06:00"});}}>
          <label>Message <textarea name="body" defaultValue={j.body} maxLength={4096}/></label>
          <label>Dhaka time <input required name="due" type="datetime-local"
            defaultValue={new Date(Date.parse(j.due)+21600000).toISOString().slice(0,16)}/></label>
          <button disabled={pending}>Save schedule</button>
        </form></details>}
      {["Scheduled","Paused"].includes(j.status) && <div className="flex gap-3">
        {[j.status==="Paused"?"resume":"pause","cancel"].map(action=><button key={action} disabled={pending}
          onClick={()=>{if(action!=="cancel" || window.confirm("Cancel this scheduled message?")) act(action,j.id);}}>{action}</button>)}</div>}
    </article>)}
  </section>;
}
