import ExploreClient from "@/components/pages/ExploreClient";
import { getPublishedQuotesForFeed } from "@/lib/queries/quote";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const quotes = await getPublishedQuotesForFeed(50);
  return <ExploreClient quotes={quotes} />;
}
