"use client";
import {FormEvent,useEffect,useState,useRef} from "react";
import {compressImage} from "./compress-image";
import {History,type Job} from "./History";
import {zones,isZone} from "@/lib/whatsapp/zones";

type Contact={id:string;label:string;address:string;consent:boolean};
const path="/api/admin/whatsapp/messages";
export function Messages({accountId}:{accountId:string}) {
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [jobs,setJobs]=useState<Job[]>([]);
  const [templates,setTemplates]=useState<{id:string;name:string;body:string}[]>([]);
  const [counts,setCounts]=useState<{status:string;count:number}[]>([]);
  const [draft,setDraft]=useState("");
  const [search,setSearch]=useState("");
  const [revision,setRevision]=useState(0);
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);
  const attachmentInput=useRef<HTMLInputElement>(null);
  const [attachment,setAttachment]=useState<File|null>(null);
  const [compressing,setCompressing]=useState(false);
  const attachmentVersion=useRef(0);
  async function selectAttachment(file?:File) {
    const version=++attachmentVersion.current;
    setAttachment(null);setError("");setCompressing(Boolean(file));
    try {
      const prepared=file ? await compressImage(file) : null;
      if(version===attachmentVersion.current) setAttachment(prepared);
    } catch {if(version===attachmentVersion.current) setError("Unable to process this attachment. Please choose another file.");}
    finally {if(version===attachmentVersion.current) setCompressing(false);}
  }
  const [requestId,setRequestId]=useState(()=>crypto.randomUUID());
  useEffect(()=>{
    const controller=new AbortController();
    void fetch(path+"?accountId="+encodeURIComponent(accountId),{signal:controller.signal,cache:"no-store"})
      .then(async response=>{
        if (!response.ok) throw new Error("Cannot load message history");
        const result=await response.json();
        setContacts(result.contacts); setJobs(result.jobs);setTemplates(result.templates);setCounts(result.counts);
      }).catch(e=>{if (!controller.signal.aborted) setError(e.message);});
    return ()=>controller.abort();
  },[accountId,revision]);
  async function act(payload:Record<string,unknown>) {
    setPending(true);setError("");
    try {
      const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...payload,accountId})});
      if (!response.ok) throw new Error((await response.json()).error || "Request failed");
      setRevision(value=>value+1);
      return true;
    } catch(e) {setError(e instanceof Error?e.message:"Request failed");return false;}
    finally {setPending(false);}
  }
  async function compose(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(compressing) return;
    const form=event.currentTarget;
    const data=new FormData(form);
    const due=data.get("due");
    const submitter=(event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action=submitter?.value === "send-now" ? "send-now" : "send";
    const timezone=data.get("timezone");
    if(!isZone(timezone)) return;
    const weekdays=data.getAll("weekday").reduce<number>((mask,day)=>mask | (1<<Number(day)),0);
    const recipient=contacts.find(c=>c.id===data.get("contactId"));
    const file=attachment;
    let media;
    if(file instanceof File && file.size) {
      if(file.size>5242880){setError("Choose a file up to 5 MiB");return;}
      const bytes=new Uint8Array(await file.arrayBuffer());
      let binary="";
      for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...Array.from(bytes.subarray(i,i+8192)));
      media={filename:file.name,base64:btoa(binary)};
    }
    if (!recipient || !window.confirm((action === "send-now" ? "Send this test message now to " : "Queue this message for ")+recipient.label+"?\n\n"+draft+
        (media?"\nAttachment: "+media.filename:""))) return;
    if (await act({action,id:requestId,media,body:data.get("body"),contactId:data.get("contactId"),
      timezone,weekdays,recurrence:data.get("recurrence"),intervalDays:data.get("intervalDays"),due:due?String(due)+":00"+zones[timezone]:null})) {
      setRequestId(crypto.randomUUID());form.reset();setDraft("");void selectAttachment();
    }
  }
  return <div className="space-y-6">
    <section><h2 className="text-xl font-semibold">Account analytics</h2>
      {counts.length ? counts.map(c=><span className="mr-4" key={c.status}>{c.status} · {c.count}</span>) : <p>No recorded messages.</p>}
    </section>
    <section><h2 className="text-xl font-semibold">Contacts &amp; Groups</h2>
      <form className="grid gap-3 my-3" onSubmit={e=>{
        e.preventDefault();const data=new FormData(e.currentTarget);
        void act({action:"contact",label:data.get("label"),address:data.get("address"),consent:data.has("consent")});
      }}>
        <label>Name <input required maxLength={120} name="label" className="border rounded p-2"/></label>
        <label>Phone, chat ID or group link <input required name="address" className="border rounded p-2"/></label>
        <label><input type="checkbox" name="consent"/> This recipient has agreed to receive messages</label>
        <button disabled={pending}>Save contact and consent</button>
      </form>
      <input aria-label="Search saved recipients" placeholder="Search saved recipients" value={search} onChange={e=>setSearch(e.target.value)}/>
      {contacts.filter(c=>(c.label+" "+c.address).toLowerCase().includes(search.toLowerCase())).map(c=><p key={c.id}>{c.label} · {c.address} · {c.consent?"Authorized":"Opted out"}</p>)}
    </section>
    <section><h2 className="text-xl font-semibold">Send Message</h2>
      <form onSubmit={compose} className="grid gap-3 my-3">
        <label>Recipient <select name="contactId" required>{contacts.filter(c=>c.consent).map(c=>
          <option value={c.id} key={c.id}>{c.label}</option>)}</select></label>
        <label>Message or caption <textarea name="body" className="w-full border rounded p-2" maxLength={4096}
          value={draft} onChange={e=>setDraft(e.target.value)}/></label>
        <label>Schedule (optional) <input type="datetime-local" name="due"/></label>
        <label>Schedule timezone <select name="timezone">{Object.keys(zones).map(z=><option key={z}>{z}</option>)}</select></label>
        <div><label>Attachment (up to 5 MiB) · large images are compressed automatically
          <input ref={attachmentInput} disabled={pending} type="file" accept="image/png,image/jpeg,image/webp,video/mp4,application/pdf,audio/ogg"
            onChange={e=>void selectAttachment(e.target.files?.[0])}/></label>
          {compressing && <p role="status">Optimizing image…</p>}
          {attachment && <p>{attachment.name} · {(attachment.size/1024).toFixed(0)} KB</p>}
          {(attachment || compressing) && <button type="button" disabled={pending} onClick={()=>{
            void selectAttachment();if(attachmentInput.current) attachmentInput.current.value="";
          }}>Remove attachment</button>}
        </div>
        <label>Repeat <select name="recurrence">{["none","daily","weekly","monthly","custom","weekdays"].map(r=>
          <option key={r}>{r}</option>)}</select></label>
        <label>Custom interval in days <input name="intervalDays" type="number" defaultValue={1} min={1} max={365}/></label>
        <fieldset><legend>Days for weekday recurrence</legend>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>
          <label key={d} className="mr-2"><input name="weekday" type="checkbox" value={i}/>{d}</label>)}</fieldset>
        <div className="flex flex-wrap gap-3">
          <button name="delivery" value="send" disabled={pending || !contacts.some(c=>c.consent)}>Schedule message</button>
          <button name="delivery" value="send-now" type="submit" disabled={pending || !contacts.some(c=>c.consent)}>Send test now</button>
        </div>
      </form>
    </section>
    <section><h2 className="text-xl font-semibold">Message Templates</h2>
      <form onSubmit={e=>{e.preventDefault();void act({action:"save-template",name:new FormData(e.currentTarget).get("name"),body:draft});}}>
        <label>Template name <input name="name" required maxLength={100}/></label>
        <button disabled={pending || !draft.trim()}>Save composer text</button>
      </form>
      {templates.map(t=><div key={t.id} className="flex gap-3"><button onClick={()=>setDraft(t.body)}>Use {t.name}</button>
        <button disabled={pending} onClick={()=>{if(window.confirm("Delete "+t.name+"?")) void act({action:"delete-template",id:t.id});}}>Delete</button></div>)}
    </section>
    <History jobs={jobs} pending={pending} refresh={()=>setRevision(v=>v+1)} act={(action,id,extra)=>void act({action,id,...extra})}/>
    {error && <p role="alert">{error}</p>}
  </div>;
}
