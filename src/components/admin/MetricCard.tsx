import Link from "next/link";
import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  className: string;
  children: ReactNode;
} & (
  | { href: string; onClick?: never; active?: never }
  | { href?: never; onClick: () => void; active?: boolean }
);

export function MetricCard({ label, className, children, href, onClick, active }: MetricCardProps) {
  const control = "absolute inset-0 z-10 rounded-[inherit] cursor-pointer transition-colors hover:bg-slate-900/5 aria-pressed:ring-2 aria-pressed:ring-inset aria-pressed:ring-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-600";

  return (
    <div className={`relative ${className}`}>
      {children}
      {href ? (
        <Link href={href} className={control} aria-label={label} prefetch={false} />
      ) : (
        <button type="button" className={control} aria-label={label} aria-pressed={active} onClick={onClick} />
      )}
    </div>
  );
}
