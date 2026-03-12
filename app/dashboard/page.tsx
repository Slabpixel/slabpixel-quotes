import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardClient from "@/components/pages/DashboardClient";
import { getDashboardQuotesWithStats } from "@/lib/queries/quote";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const { quotes, stats } = await getDashboardQuotesWithStats();
  return <DashboardClient quotes={quotes} stats={stats} />;
}
