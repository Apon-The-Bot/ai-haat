import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface OrderSuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const rawId = searchParams?.orderId || searchParams?.id || "";
  const orderId = typeof rawId === "string" ? rawId.trim() : Array.isArray(rawId) ? rawId[0]?.trim() : "";

  if (orderId) {
    redirect(`/order-tracking?orderId=${encodeURIComponent(orderId)}`);
  }

  redirect("/order-tracking");
}
