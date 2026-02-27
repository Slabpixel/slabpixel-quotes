import { prisma } from "@/lib/db";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const quotes = await prisma.quote.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      id: true,
      text: true,
      attribution: true,
      socialHandle: true,
      authorPhoto: true,
      fontPrimary: true,
      fontSecondary: true,
      colorPalette: true,
      mood: true,
      cardImageUrl: true,
      publishedAt: true,
      submitter: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Serialize dates for client component
  const serializedQuotes = quotes.map((q) => ({
    ...q,
    publishedAt: q.publishedAt?.toISOString() ?? null,
  }));

  return <HomeClient quotes={serializedQuotes} />;
}
