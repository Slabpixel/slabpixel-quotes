import ExploreClient from "@/components/pages/ExploreClient";
import { getPublishedQuotesForFeed } from "@/lib/queries/quote";

export default async function ExplorePage() {
  const quotes = await getPublishedQuotesForFeed(24);
  return <ExploreClient quotes={quotes} />;
}
