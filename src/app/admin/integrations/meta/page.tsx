"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { graphVersions, META_EVENTS, metaTriggers, type MetaEventName } from "@/lib/analytics/meta-events";

const controls = {
  enabled: "Enable Meta integration", paused: "Pause tracking", browser: "Browser Pixel",
  capi: "Server Conversions API", standard: "Standard events", advanced: "Server advanced matching",
  diagnostics: "Event diagnostics", testMode: "Test mode (pauses production events)",
} as const;
type Settings = Record<keyof typeof controls, boolean> & {
  pixelId: string; graphVersion: string; connection: string; testedAt: string | null;
  hasToken: boolean; hasTestCode: boolean; events: Record<MetaEventName, boolean>;
};
type Diagnostic = { id: string; eventName: string; status: string; attempts: number; lastError: string | null; createdAt: string; sentAt: string | null };
const endpoint = "/api/admin/integrations/meta";
const panel = "space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6";
const field = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2";

export default function MetaIntegrationPage() {
  const [settings, setSettings] = useState<Settings>();
  const [savedId, setSavedId] = useState("");
  const [events, setEvents] = useState<Diagnostic[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const token = useRef<HTMLInputElement>(null);
  const testCode = useRef<HTMLInputElement>(null);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSettings(data.settings);
      setSavedId(data.settings.pixelId);
      setEvents(data.events);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not load settings.");
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function submit(action: "save" | "test", e?: FormEvent) {
    e?.preventDefault();
    if (!settings || busy) return;
    const replacement = token.current?.value.trim();
    if (action === "save" && savedId && (savedId !== settings.pixelId || replacement) &&
      !window.confirm("Replace the dataset or credential? Pending events keep their original dataset.")) return;
    if (action === "test" && !window.confirm("Send one synthetic event to Meta Events Manager Test Events?")) return;
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, settings: action === "save" ? {
          ...settings, token: replacement || undefined, testCode: testCode.current?.value.trim() || undefined,
        } : undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSettings(data.settings);
      setSavedId(data.settings.pixelId);
      if (token.current) token.current.value = "";
      if (testCode.current) testCode.current.value = "";
      setFeedback(action === "save" ? "Settings saved." : data.settings.connection === "accepted"
        ? "Meta accepted the synthetic test event. Confirm it in Events Manager."
        : `Meta test failed (${data.testReason}).`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not update Meta settings.");
    } finally {
      setBusy(false);
    }
  }

  const status = !settings?.pixelId ? "Not configured" : settings.capi && !settings.hasToken ? "Configuration incomplete"
    : !settings.enabled || settings.paused ? "Disabled" : !settings.capi ? "Browser configured"
    : settings.connection === "accepted" ? "Connection test successful" : settings.connection === "failed"
      ? "Connection test failed" : "Validation pending";

  return (
    <main className="mx-auto max-w-5xl space-y-5 text-sm text-slate-800">
      <header><h1 className="text-2xl font-bold">Meta Pixel &amp; Conversions API</h1>
        <p className="mt-1 text-slate-600">Manage advertising events for the storefront and verified purchases.</p></header>
      {feedback && <p role="status" className="rounded-xl bg-slate-100 p-3">{feedback}</p>}
      {!settings ? <p>Meta settings are unavailable until the integration loads.</p> : <>
        <form className="space-y-5" onSubmit={(e) => void submit("save", e)}>
          <section className={panel}>
            <h2 className="text-base font-bold">Connection</h2>
            <p>{status}{settings.testedAt && ` · Tested ${new Date(settings.testedAt).toLocaleString()}`}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>Pixel / Dataset ID<input className={field} value={settings.pixelId} inputMode="numeric"
                onChange={(e) => setSettings({ ...settings, pixelId: e.target.value })} maxLength={25} /></label>
              <label>Graph API version<select className={field} value={settings.graphVersion}
                onChange={(e) => setSettings({ ...settings, graphVersion: e.target.value })}>
                {graphVersions.map((version) => <option key={version}>{version}</option>)}</select></label>
              <label>CAPI access token<input className={field} ref={token} type="password" autoComplete="new-password"
                placeholder={settings.hasToken ? "Token saved · enter replacement" : "Enter token"} maxLength={2048} /></label>
              <label>Test event code<input className={field} ref={testCode} type="password" autoComplete="off"
                placeholder={settings.hasTestCode ? "Code saved · enter replacement" : "Enter Events Manager code"} maxLength={64} /></label>
            </div>
          </section>
          <section className={panel}>
            <h2 className="text-base font-bold">Channels, privacy and diagnostics</h2>
            <p>Advertising consent is required. Advanced matching adds hashed customer identifiers on the server.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(controls).map(([name, label]) => {
                const key = name as keyof typeof controls;
                return <label key={name} className="flex items-center gap-2"><input type="checkbox" checked={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} />{label}</label>;
              })}
            </div>
          </section>
          <section className={panel}>
            <h2 className="text-base font-bold">Event configuration</h2>
            {META_EVENTS.map((name) => <label key={name} className="flex items-start gap-3 border-b border-slate-100 pb-2">
              <input type="checkbox" checked={settings.events[name]}
                onChange={(e) => setSettings({ ...settings, events: { ...settings.events, [name]: e.target.checked } })} />
              <span><strong>{name}</strong><br />{metaTriggers[name]} · {name === "Purchase" ? "Pixel + CAPI" : "Pixel"}</span>
            </label>)}
            <button type="button" className="underline" onClick={() => setSettings({
              ...settings, events: Object.fromEntries(META_EVENTS.map((event) => [event, true])) as Settings["events"],
            })}>Restore event defaults</button>
          </section>
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Save settings</button>
            <button type="button" disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2"
              onClick={() => void submit("test")}>Test Meta connection</button>
          </div>
        </form>
        <section className={panel}>
          <div className="flex justify-between gap-2"><h2 className="text-base font-bold">Recent purchase events</h2>
            <button type="button" className="underline" onClick={() => void refresh()}>Refresh saved settings and events</button></div>
          <p>Meta acceptance means the API received the event. Browser delivery and attribution are available in Meta Events Manager.</p>
          {!events.length && <p>{settings.diagnostics ? "No recorded purchase events." : "Diagnostics disabled."}</p>}
          {events.map((event) => <div key={event.id} className="flex flex-wrap gap-x-3 border-t border-slate-100 pt-2">
            <strong>{event.eventName}</strong><span>{event.status}</span><span>{event.attempts} attempts</span>
            <time>{new Date(event.sentAt || event.createdAt).toLocaleString()}</time>{event.lastError && <span>{event.lastError}</span>}
          </div>)}
        </section>
      </>}
    </main>
  );
}
