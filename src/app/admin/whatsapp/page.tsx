"use client";
import { useCallback, useEffect, useState } from "react";
import { Messages } from "./Messages";
import styles from "./whatsapp.module.css";

type Account = {id:string; label:string; state:string; qr:string|null;pairing:string|null};
const endpoint = "/api/admin/whatsapp/accounts";
export default function WhatsAppAutomation() {
  const [accounts,setAccounts] = useState<Account[]>([]);
  const [label,setLabel] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [selected,setSelected] = useState("");
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(endpoint,{cache:"no-store"});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Cannot load accounts");
      setAccounts(result.accounts);
      setError("");
    } catch (e) { setAccounts([]); setError(e instanceof Error ? e.message : "Unable to load accounts"); }
  },[]);
  useEffect(() => { void refresh(); },[refresh]);
  const pairing = accounts.some(row => ["Waiting for QR Scan","Connecting","Reconnecting","Syncing groups","Logout requested","Disconnect requested"].includes(row.state));
  useEffect(() => {
    if (!pairing) return;
    const timer = setInterval(() => { if (!document.hidden) void refresh(); },4000);
    return () => clearInterval(timer);
  },[pairing,refresh]);
  async function submit(action:string,id?:string,phone?:string) {
    setBusy(true);
    try {
      const response = await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action,id,label,phone})});
      if (!response.ok) throw new Error((await response.json()).error || "Account action failed");
      if (action === "create") setLabel("");
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Account action failed"); }
    finally { setBusy(false); }
  }
  return <main className={styles.workspace}>
    <header><span className={styles.eyebrow}>COMMUNICATIONS HUB</span>
    <h1>WhatsApp Automation</h1>
    <p>Connect your accounts, manage recipients and organize your messages.</p></header>
    <aside className={styles.notice}>Baileys is an unofficial WhatsApp integration. Linked accounts may face restrictions.</aside>
    <section>
    <h2 className="text-xl font-semibold">Connected Accounts</h2>
    <form className="flex flex-wrap gap-3" onSubmit={e => {e.preventDefault(); void submit("create");}}>
      <input aria-label="Account name" className="rounded border p-2" required maxLength={120}
        placeholder="Account name" value={label} onChange={e=>setLabel(e.target.value)}/>
      <button disabled={busy}>Add account</button>
      <button type="button" onClick={()=>void refresh()}>Refresh</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {!accounts.length && !error && <p className={styles.empty}>Add your first account to get started. Then connect it using a QR code or your phone number.</p>}
    {accounts.map(row=><section className="rounded-lg border p-4 space-y-2" key={row.id}>
      <h3 className="font-semibold">{row.label}</h3><span className={styles.badge}>{row.state}</span>
      {row.qr && <img src={row.qr} width={220} height={220} alt="Scan this code in WhatsApp Linked devices"/>}
      {row.pairing && <p>Linked devices pairing code <strong>{row.pairing}</strong></p>}
      {["Disconnected","Authentication Expired","Connection Failed"].includes(row.state) &&
        <form onSubmit={e=>{e.preventDefault();void submit("connect",row.id,String(new FormData(e.currentTarget).get("phone")));}}>
          <label>International phone <input name="phone" type="tel" pattern="[1-9][0-9]{7,14}" required placeholder="880…"/></label>
          <button disabled={busy}>Pair with phone number</button>
        </form>}
      <button disabled={busy} onClick={()=>void submit(["Connecting","Connected","Waiting for QR Scan","Reconnecting"].includes(row.state) ? "disconnect" : "connect",row.id)}>
        {["Connecting","Connected","Waiting for QR Scan","Reconnecting"].includes(row.state) ? "Disconnect" : "Connect"}
      </button>
      {row.state==="Connected" && <button className="ml-3" disabled={busy}
        onClick={()=>void submit("sync-groups",row.id)}>Sync groups</button>}
      {row.state==="Connected" && <button className="ml-3" disabled={busy}
        onClick={()=>{if(window.confirm("Unlink this WhatsApp device?")) void submit("logout",row.id);}}>Log out</button>}
      {["Disconnected","Authentication Expired"].includes(row.state) && <button className="ml-3" disabled={busy}
        onClick={()=>{if(window.confirm("Remove this account and its saved contacts?")) void submit("remove",row.id);}}>Remove account</button>}
    </section>)}
    </section>
    {accounts.length > 0 && <><label>Sending account <select value={selected || accounts[0].id}
      onChange={e=>setSelected(e.target.value)}>{accounts.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></label>
      <Messages key={selected || accounts[0].id} accountId={selected || accounts[0].id}/></>}
  </main>;
}
