import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import YourQuotesClient from "@/components/pages/YourQuotesClient";

export default async function YourQuotesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/your-quotes");
  }

  const quotes = await prisma.quote.findMany({
    where: { submitterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      text: true,
      attribution: true,
      socialHandles: true,
      status: true,
      mood: true,
      colorPalette: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  const serializedQuotes = quotes.map((q) => ({
    ...q,
    socialHandles: Array.isArray(q.socialHandles) ? (q.socialHandles as string[]) : [],
    createdAt: q.createdAt.toISOString(),
    publishedAt: q.publishedAt?.toISOString() ?? null,
  }));

  return (
    <YourQuotesClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      quotes={serializedQuotes}
    />
  );
}
