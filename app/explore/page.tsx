import { prisma } from "@/lib/db";
import ExploreClient from "@/components/pages/ExploreClient";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
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
      backgroundId: true,
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
          profilePhoto: true,
          image: true,
        },
      },
    },
  });

  const serializedQuotes = quotes.map((q) => ({
    ...q,
    publishedAt: q.publishedAt?.toISOString() ?? null,
  }));

  return <ExploreClient quotes={serializedQuotes} />;
}
