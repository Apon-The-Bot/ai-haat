import { redirect } from "next/navigation";

export default function ReferralsDashboardPage() {
  // Keep the historical URL working while making Affiliate the sole active program.
  redirect("/dashboard/affiliate");
}
