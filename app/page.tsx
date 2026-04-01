import HomeClient from "@/components/pages/HomeClient";
import { getPublishedQuotesForFeed } from "@/lib/queries/quote";

export default async function HomePage() {
  const quotes = await getPublishedQuotesForFeed(24);
  return <HomeClient quotes={quotes} />;
}
