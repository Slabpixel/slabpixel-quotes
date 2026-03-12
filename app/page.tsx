import HomeClient from "@/components/pages/HomeClient";
import { getPublishedQuotesForFeed } from "@/lib/queries/quote";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const quotes = await getPublishedQuotesForFeed(50);
  return <HomeClient quotes={quotes} />;
}
