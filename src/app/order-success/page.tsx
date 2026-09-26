import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface OrderSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawId = resolvedSearchParams?.orderId || resolvedSearchParams?.id || "";
  const orderId = typeof rawId === "string" ? rawId.trim() : Array.isArray(rawId) ? rawId[0]?.trim() : "";

  // Strictly sanitize order identifier (alphanumeric, dashes, underscores only) to prevent open redirects or payload injection
  const sanitizedId = orderId.replace(/[^a-zA-Z0-9_-]/g, "");

  if (sanitizedId) {
    redirect(`/order-tracking?orderId=${encodeURIComponent(sanitizedId)}`);
  }

  redirect("/order-tracking");
}
