import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6">
      <Link className="underline" href="/staff">Staff workspace</Link>
      {children}
    </main>
  );
}
