import Link from "next/link";

export function StaffAccessRequired({ path }: { path: string }) {
  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold">Staff permission and verified MFA required</h1>
      <div className="flex flex-wrap gap-4">
        <Link className="underline" href={`/login?callbackUrl=${encodeURIComponent(path)}`}>Sign in</Link>
        <Link className="underline" href="/dashboard/security">Set up MFA</Link>
        <Link className="underline" href={`/auth/verify?callbackUrl=${encodeURIComponent(path)}`}>Verify MFA</Link>
      </div>
    </section>
  );
}
