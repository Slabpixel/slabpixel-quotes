import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import YourQuotesClient from "@/components/pages/YourQuotesClient";
import { getUserQuotesForYourQuotes } from "@/lib/queries/quote";

export default async function YourQuotesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/your-quotes");
  }

  const quotes = await getUserQuotesForYourQuotes(session.user.id);

  return (
    <YourQuotesClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      quotes={quotes}
    />
  );
}
