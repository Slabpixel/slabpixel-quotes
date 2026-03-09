import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import DashboardClient from "@/components/pages/DashboardClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  const quotes = await prisma.quote.findMany({
    where: { submitterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      text: true,
      attribution: true,
      socialHandle: true,
      status: true,
      mood: true,
      colorPalette: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  const serializedQuotes = quotes.map((q) => ({
    ...q,
    createdAt: q.createdAt.toISOString(),
    publishedAt: q.publishedAt?.toISOString() ?? null,
  }));

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      quotes={serializedQuotes}
    />
  );
}
