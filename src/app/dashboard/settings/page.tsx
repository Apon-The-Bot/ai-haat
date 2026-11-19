"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { useToast } from "@/context/ToastContext";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setName(user?.name || ""); setPhone(user?.phone || ""); setImage(user?.avatar); }, [user]);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save profile");
      await refreshUser(); showToast("Profile updated successfully", "success");
    } catch (error) { showToast(error instanceof Error ? error.message : "Could not save profile", "error"); } finally { setSaving(false); }
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/account/profile/avatar", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setImage(data.user.image); await refreshUser(); showToast("Profile photo updated", "success");
    } catch (error) { showToast(error instanceof Error ? error.message : "Upload failed", "error"); } finally { setUploading(false); }
  }

  async function removePhoto() {
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: null }) });
    if (response.ok) { await refreshUser(); showToast("Profile photo removed", "success"); }
  }

  return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-[#FC5C03]">Account</p><h1 className="mt-2 text-3xl font-black text-[#1A1D26]">Profile settings</h1><p className="mt-2 text-sm text-slate-500">Manage your personal details and profile photo.</p></div>
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><UserAvatar image={image} name={name || user?.email || "AI Haat member"} email={user?.email} size="lg" /><h2 className="mt-4 font-bold text-[#1A1D26]">{name || "AI Haat member"}</h2><p className="mt-1 break-all text-xs text-slate-500">{user?.email}</p><label className="mt-5 block cursor-pointer rounded-xl bg-[#FC5C03] px-4 py-3 text-sm font-bold text-white">{uploading ? "Uploading…" : "Upload photo"}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>{image && <button type="button" onClick={removePhoto} className="mt-3 text-xs font-semibold text-slate-500 hover:text-[#FC5C03]">Remove custom photo</button>}<p className="mt-4 text-[11px] leading-5 text-slate-500">JPG, PNG or WebP · maximum 10MB. Google photo is restored when a custom photo is removed.</p></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#1A1D26]">Personal information</h2><form onSubmit={save} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-[#1A1D26]">Full name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FC5C03]" required /></label><label className="block text-sm font-semibold text-[#1A1D26]">Email address<input value={user?.email || ""} disabled className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500" /></label><label className="block text-sm font-semibold text-[#1A1D26]">Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FC5C03]" placeholder="Optional" /></label><button disabled={saving} className="rounded-xl bg-[#1A1D26] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></form><div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2"><Link href="/dashboard/security" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#1A1D26] hover:border-[#FC5C03]">Security & 2FA</Link><Link href="/dashboard/preferences" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#1A1D26] hover:border-[#FC5C03]">Email preferences</Link></div></section>
    </div>
  </main>;
}

